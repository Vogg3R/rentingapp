from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ItemRequestCreate(BaseModel):
    title: str = Field(min_length=3, max_length=140)
    category: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=10, max_length=3000)
    max_daily_budget: float = Field(ge=0)
    duration_days: int = Field(ge=1)
    location: str = Field(min_length=2, max_length=255)
    requester_id: UUID


class ItemRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    requester_id: UUID
    title: str
    category: str
    description: str
    max_daily_budget: Decimal
    duration_days: int
    location: str
    status: str
    created_at: datetime
