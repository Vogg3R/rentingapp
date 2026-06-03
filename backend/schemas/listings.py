from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ListingCreate(BaseModel):
    title: str = Field(min_length=3, max_length=140)
    description: str = Field(min_length=10, max_length=3000)
    category: str = Field(min_length=2, max_length=120)
    daily_price: float = Field(ge=0)
    min_days: int = Field(ge=1)
    max_days: int = Field(ge=1)
    location: str = Field(min_length=2, max_length=255)


class ListingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    owner_id: UUID
    title: str
    description: str
    category: str
    daily_price: Decimal
    min_days: int
    max_days: int
    location: str
    status: str
    created_at: datetime
