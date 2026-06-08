from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ListingRentalRequestCreate(BaseModel):
    start_date: date
    end_date: date
    total_days: int = Field(ge=1)
    total_price: float = Field(ge=0)


class ListingRentalRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    listing_id: UUID
    renter_id: UUID
    start_date: date
    end_date: date
    total_days: int
    total_price: Decimal
    status: str
    created_at: datetime
    conversation_id: UUID | None = None


class ListingMessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=2000)


class ListingMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    conversation_id: UUID
    sender_id: UUID
    sender_name: str | None = None
    body: str
    created_at: datetime


class ListingRentalConversationSummary(BaseModel):
    id: UUID
    listing_id: UUID
    listing_title: str
    counterparty_name: str | None = None
    role: str
    status: str
    total_price: Decimal
    total_days: int
    start_date: date
    end_date: date
    last_message: str | None = None
    last_message_at: datetime | None = None
    created_at: datetime
