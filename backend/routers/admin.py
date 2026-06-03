from uuid import UUID

from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from deps import get_db
from schemas.wallet import WalletTransactionRead
from schemas.deals import RentalDealRead
from services import admin as admin_service
from services import deals as deals_service

router = APIRouter()


def _admin_key(x_admin_key: str | None = Header(default=None, alias="X-Admin-Key")) -> None:
    admin_service.require_admin_key(x_admin_key)


@router.get(
    "/withdrawals/pending",
    response_model=list[WalletTransactionRead],
    dependencies=[Depends(_admin_key)],
)
def list_pending_withdrawals(db: Session = Depends(get_db)) -> list[WalletTransactionRead]:
    return admin_service.list_pending_withdrawals(db)


@router.post(
    "/withdrawals/{transaction_id}/approve",
    response_model=WalletTransactionRead,
    dependencies=[Depends(_admin_key)],
)
def approve_withdrawal(
    transaction_id: UUID,
    db: Session = Depends(get_db),
) -> WalletTransactionRead:
    return admin_service.approve_withdrawal(db, transaction_id)


@router.post(
    "/withdrawals/{transaction_id}/reject",
    response_model=WalletTransactionRead,
    dependencies=[Depends(_admin_key)],
)
def reject_withdrawal(
    transaction_id: UUID,
    db: Session = Depends(get_db),
) -> WalletTransactionRead:
    return admin_service.reject_withdrawal(db, transaction_id)


@router.post(
    "/deals/{deal_id}/refund",
    response_model=RentalDealRead,
    dependencies=[Depends(_admin_key)],
)
def refund_deal(deal_id: UUID, db: Session = Depends(get_db)) -> RentalDealRead:
    return deals_service.refund_disputed_deal(db, deal_id)
