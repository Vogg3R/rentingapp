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
    # Base64 data URL (data:image/...;base64,...) — opsiyonel temsili görsel
    image_base64: str | None = None


class RequesterPreview(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str | None = None
    avatar_base64: str | None = None


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
    image_base64: str | None = None
    status: str
    created_at: datetime
    requester: RequesterPreview | None = None
