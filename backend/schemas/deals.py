from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RentalDealRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    item_request_id: UUID
    accepted_offer_id: UUID
    escrow_status: str
    delivery_confirmed_at: datetime | None
    deal_status: str
    created_at: datetime


class RentalDealSummary(BaseModel):
    id: UUID
    item_request_title: str
    offer_price: Decimal
    escrow_status: str
    deal_status: str
    role: str  # requester | supplier
    created_at: datetime


class MessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    thread_id: UUID
    sender_id: UUID
    body: str
    created_at: datetime
