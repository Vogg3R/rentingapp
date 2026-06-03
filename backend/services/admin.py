import os
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from crud import wallets as wallets_crud

ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "").strip()


def require_admin_key(provided: str | None) -> None:
    if not ADMIN_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="ADMIN_API_KEY ortam değişkeni tanımlı değil.",
        )
    if not provided or provided != ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Geçersiz admin anahtarı.")


def list_pending_withdrawals(db: Session):
    return wallets_crud.list_pending_withdrawals(db)


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
