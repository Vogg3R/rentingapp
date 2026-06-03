from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from crud import rental_deals as deals_crud
from crud import wallets as wallets_crud
from models import RentalDeal, User
from schemas.deals import MessageCreate, RentalDealSummary
from services import escrow as escrow_service


def _deal_participant(deal: RentalDeal, user_id: UUID) -> bool:
    if deal.item_request.requester_id == user_id:
        return True
    if deal.accepted_offer.supplier_id == user_id:
        return True
    return False


def get_deal(db: Session, deal_id: UUID, user: User) -> RentalDeal:
    deal = deals_crud.get_deal_by_id(db, deal_id)
    if deal is None:
        raise HTTPException(status_code=404, detail="Kiralama işlemi bulunamadı.")
    if not _deal_participant(deal, user.id):
        raise HTTPException(status_code=403, detail="Bu işleme erişim yetkiniz yok.")
    return deal


def list_my_deals(db: Session, user: User) -> list[RentalDealSummary]:
    rows = deals_crud.list_deals_for_user(db, user.id)
    out: list[RentalDealSummary] = []
    for deal in rows:
        req = deal.item_request
        role = "requester" if req.requester_id == user.id else "supplier"
        out.append(
            RentalDealSummary(
                id=deal.id,
                item_request_title=req.title,
                offer_price=deal.accepted_offer.price_amount,
                escrow_status=deal.escrow_status,
                deal_status=deal.deal_status,
                role=role,
                created_at=deal.created_at,
            )
        )
    return out


def list_messages(db: Session, deal_id: UUID, user: User):
    deal = get_deal(db, deal_id, user)
    thread = deals_crud.get_thread_for_deal(db, deal.id)
    if thread is None:
        return []
    return deals_crud.list_messages(db, thread.id)


def send_message(db: Session, deal_id: UUID, user: User, body: MessageCreate):
    deal = get_deal(db, deal_id, user)
    thread = deals_crud.get_thread_for_deal(db, deal.id)
    if thread is None:
        raise HTTPException(status_code=500, detail="Mesaj kanalı bulunamadı.")
    return deals_crud.add_message(
        db, thread_id=thread.id, sender_id=user.id, body=body.body
    )


def open_dispute(db: Session, deal_id: UUID, user: User, reason: str) -> RentalDeal:
    deal = get_deal(db, deal_id, user)
    if deal.deal_status == "completed":
        raise HTTPException(status_code=400, detail="Tamamlanmış işlemde anlaşmazlık açılamaz.")
    deal.deal_status = "disputed"
    db.commit()
    db.refresh(deal)
    return deal


def refund_disputed_deal(db: Session, deal_id: UUID) -> RentalDeal:
    """Admin: escrow funded ise talep edene iade."""
    deal = deals_crud.get_deal_by_id(db, deal_id)
    if deal is None:
        raise HTTPException(status_code=404, detail="İşlem bulunamadı.")
    if deal.deal_status != "disputed":
        raise HTTPException(status_code=400, detail="Yalnızca anlaşmazlıktaki işlemler iade edilebilir.")
    if deal.escrow_status == "funded":
        amount = deal.accepted_offer.price_amount
        requester_id = deal.item_request.requester_id
        wallet = wallets_crud.get_or_create_wallet(db, requester_id)
        wallet.balance += amount
        wallets_crud.add_transaction(
            db,
            wallet_id=wallet.id,
            tx_type="escrow_release",
            amount=amount,
            status="completed",
            external_ref=f"refund-{deal.id}",
        )
        deal.escrow_status = "refunded"
    deal.deal_status = "completed"
    db.commit()
    db.refresh(deal)
    return deal


def confirm_delivery(db: Session, deal_id: UUID, user: User) -> RentalDeal:
    deal = get_deal(db, deal_id, user)
    if deal.item_request.requester_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="Teslim onayını yalnızca talep eden verebilir.",
        )
    if deal.deal_status == "completed":
        raise HTTPException(status_code=400, detail="Teslimat zaten onaylanmış.")
    escrow_service.release_funds_for_deal(db, deal=deal)
    deal.delivery_confirmed_at = datetime.now(UTC)
    deal.deal_status = "completed"
    db.commit()
    db.refresh(deal)
    return deal
