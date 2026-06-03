from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from models import Wallet, WalletTransaction


def get_wallet_by_user_id(db: Session, user_id: UUID) -> Wallet | None:
    return (
        db.execute(select(Wallet).where(Wallet.user_id == user_id)).scalar_one_or_none()
    )


def create_wallet(db: Session, user_id: UUID) -> Wallet:
    wallet = Wallet(user_id=user_id, balance=Decimal("0"))
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    return wallet


def get_or_create_wallet(db: Session, user_id: UUID) -> Wallet:
    wallet = get_wallet_by_user_id(db, user_id)
    if wallet is not None:
        return wallet
    return create_wallet(db, user_id)


def add_transaction(
    db: Session,
    *,
    wallet_id: UUID,
    tx_type: str,
    amount: Decimal,
    status: str,
    external_ref: str | None = None,
) -> WalletTransaction:
    row = WalletTransaction(
        wallet_id=wallet_id,
        type=tx_type,
        amount=amount,
        status=status,
        external_ref=external_ref,
    )
    db.add(row)
    return row


def get_transaction_by_id(db: Session, tx_id: UUID) -> WalletTransaction | None:
    return (
        db.execute(select(WalletTransaction).where(WalletTransaction.id == tx_id))
        .scalar_one_or_none()
    )


def list_pending_withdrawals(db: Session) -> list[WalletTransaction]:
    return list(
        db.execute(
            select(WalletTransaction)
            .where(
                WalletTransaction.type == "withdrawal",
                WalletTransaction.status == "pending",
            )
            .order_by(WalletTransaction.created_at.asc())
        ).scalars()
    )


def list_transactions(db: Session, wallet_id: UUID, limit: int = 50) -> list[WalletTransaction]:
    return list(
        db.execute(
            select(WalletTransaction)
            .where(WalletTransaction.wallet_id == wallet_id)
            .order_by(WalletTransaction.created_at.desc())
            .limit(limit)
        ).scalars()
    )
