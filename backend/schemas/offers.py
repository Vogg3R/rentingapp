from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class OfferCreate(BaseModel):
    price_amount: float = Field(gt=0)
    description: str = Field(min_length=5, max_length=2000)


class OfferRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    item_request_id: UUID
    supplier_id: UUID
    price_amount: Decimal
    description: str
    status: str
    created_at: datetime
