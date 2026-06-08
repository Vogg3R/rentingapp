from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from schemas.listings import ListingRead
from schemas.offers import OfferRead
from schemas.requests import ItemRequestRead


class ProfileUpdate(BaseModel):
    name: str | None = Field(None, max_length=120)
    location: str | None = Field(None, max_length=255)
    bio: str | None = Field(None, max_length=2000)
    instagram: str | None = Field(None, max_length=64)
    linkedin: str | None = Field(None, max_length=255)
    avatar_base64: str | None = Field(None, max_length=2_500_000)
    cover_base64: str | None = Field(None, max_length=2_500_000)


class PublicProfile(BaseModel):
    """Başka kullanıcıların görebileceği profil (e-posta, telefon, bakiye yok)."""

    user_id: UUID
    name: str | None = None
    location: str | None = None
    bio: str | None = None
    instagram: str | None = None
    linkedin: str | None = None
    avatar_base64: str | None = None
    cover_base64: str | None = None
    listings_count: int
    listings: list[ListingRead]


class ProfileSummary(BaseModel):
    user_id: UUID
    email: str | None
    phone: str | None
    name: str | None = None
    location: str | None = None
    bio: str | None = None
    instagram: str | None = None
    linkedin: str | None = None
    avatar_base64: str | None = None
    cover_base64: str | None = None
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
