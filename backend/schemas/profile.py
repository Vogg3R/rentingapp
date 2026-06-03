from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from schemas.listings import ListingRead
from schemas.offers import OfferRead
from schemas.requests import ItemRequestRead


class ProfileSummary(BaseModel):
    user_id: UUID
    email: str | None
    phone: str | None
    listings_count: int
    requests_count: int
    offers_count: int
    deals_count: int
    listings: list[ListingRead]
    requests: list[ItemRequestRead]
    offers: list[OfferRead]


class ReviewPlaceholder(BaseModel):
    """MVP: değerlendirme sistemi V2; şimdilik boş liste."""

    id: str
    rating: float
    comment: str
    created_at: datetime
