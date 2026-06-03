from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from deps import get_current_user, get_db
from models import User
from pydantic import BaseModel, Field

from schemas.deals import MessageCreate, MessageRead, RentalDealRead, RentalDealSummary
from services import deals as deals_service

router = APIRouter()


@router.get("", response_model=list[RentalDealSummary])
def list_my_deals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[RentalDealSummary]:
    return deals_service.list_my_deals(db, current_user)


@router.get("/{deal_id}", response_model=RentalDealRead)
def get_deal(
    deal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RentalDealRead:
    return deals_service.get_deal(db, deal_id, current_user)


@router.get("/{deal_id}/messages", response_model=list[MessageRead])
def list_deal_messages(
    deal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[MessageRead]:
    return deals_service.list_messages(db, deal_id, current_user)


@router.post("/{deal_id}/messages", response_model=MessageRead, status_code=201)
def send_deal_message(
    deal_id: UUID,
    body: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageRead:
    return deals_service.send_message(db, deal_id, current_user, body)


class DisputeCreate(BaseModel):
    reason: str = Field(min_length=5, max_length=2000)


@router.post("/{deal_id}/dispute", response_model=RentalDealRead)
def open_dispute(
    deal_id: UUID,
    body: DisputeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RentalDealRead:
    return deals_service.open_dispute(db, deal_id, current_user, body.reason)


@router.post("/{deal_id}/confirm-delivery", response_model=RentalDealRead)
def confirm_delivery(
    deal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RentalDealRead:
    return deals_service.confirm_delivery(db, deal_id, current_user)
