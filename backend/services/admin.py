import os
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from crud import rental_deals as deals_crud
from crud import users as users_crud
from crud import wallets as wallets_crud
from schemas.admin import AdminDealRead, AdminUserRead, AdminWithdrawalRead

ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "").strip()


def require_admin_key(provided: str | None) -> None:
    if not ADMIN_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="ADMIN_API_KEY ortam değişkeni tanımlı değil.",
        )
    if not provided or provided != ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Geçersiz admin anahtarı.")


def list_users(db: Session) -> list[AdminUserRead]:
    return [AdminUserRead.model_validate(u) for u in users_crud.list_users(db)]


def delete_user(db: Session, user_id: UUID) -> None:
    user = users_crud.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    try:
        # Kullanıcıyla birlikte ilan, talep, teklif, kiralama işlemi ve
        # mesajları da silinir (cascade).
        users_crud.delete_user_with_content(db, user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=(
                "Kullanıcı silinirken bağlı kayıtlar nedeniyle bir sorun oluştu. "
                "Lütfen tekrar deneyin."
            ),
        )


def list_pending_withdrawals(db: Session) -> list[AdminWithdrawalRead]:
    rows = wallets_crud.list_pending_withdrawals(db)
    out: list[AdminWithdrawalRead] = []
    for tx in rows:
        wallet = tx.wallet
        user = wallet.user if wallet else None
        out.append(
            AdminWithdrawalRead(
                id=tx.id,
                user_id=user.id if user else (wallet.user_id if wallet else tx.wallet_id),
                user_name=user.name if user else None,
                amount=tx.amount,
                iban=tx.external_ref,
                created_at=tx.created_at,
            )
        )
    return out


def list_disputed_deals(db: Session) -> list[AdminDealRead]:
    rows = deals_crud.list_disputed_deals(db)
    out: list[AdminDealRead] = []
    for deal in rows:
        req = deal.item_request
        offer = deal.accepted_offer
        out.append(
            AdminDealRead(
                id=deal.id,
                item_request_title=req.title if req else "—",
                requester_name=req.requester.name if req and req.requester else None,
                supplier_name=offer.supplier.name if offer and offer.supplier else None,
                amount=offer.price_amount if offer else 0,
                escrow_status=deal.escrow_status,
                deal_status=deal.deal_status,
                created_at=deal.created_at,
            )
        )
    return out


def approve_withdrawal(db: Session, transaction_id: UUID):
    tx = wallets_crud.get_transaction_by_id(db, transaction_id)
    if tx is None:
        raise HTTPException(status_code=404, detail="İşlem bulunamadı.")
    if tx.type != "withdrawal" or tx.status != "pending":
        raise HTTPException(status_code=400, detail="Bu işlem onaylanabilir bir çekim değil.")
    tx.status = "completed"
    db.commit()
    db.refresh(tx)
    return tx


def reject_withdrawal(db: Session, transaction_id: UUID):
    tx = wallets_crud.get_transaction_by_id(db, transaction_id)
    if tx is None:
        raise HTTPException(status_code=404, detail="İşlem bulunamadı.")
    if tx.type != "withdrawal" or tx.status != "pending":
        raise HTTPException(status_code=400, detail="Bu işlem reddedilebilir bir çekim değil.")
    from models import Wallet

    wallet = db.get(Wallet, tx.wallet_id)
    if wallet is not None:
        wallet.balance += tx.amount
    tx.status = "failed"
    db.commit()
    db.refresh(tx)
    return tx
