from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from crud import item_requests as requests_crud
from crud import listings as listings_crud
from crud import offers as offers_crud
from crud import rental_deals as deals_crud
from crud import users as users_crud
from models import User
from schemas.profile import ProfileSummary, ProfileUpdate, PublicProfile


def _build_summary(
    db: Session,
    user: User,
) -> ProfileSummary:
    listings = listings_crud.list_listings_by_owner(db, user.id)
    requests = requests_crud.list_item_requests_by_requester(db, user.id)
    offers = offers_crud.list_offers_by_supplier(db, user.id)
    deals = deals_crud.list_deals_for_user(db, user.id)

    return ProfileSummary(
        user_id=user.id,
        email=user.email,
        phone=user.phone,
        name=user.name,
        location=user.location,
        bio=user.bio,
        instagram=user.instagram,
        linkedin=user.linkedin,
        avatar_base64=user.avatar_base64,
        cover_base64=user.cover_base64,
        listings_count=len(listings),
        requests_count=len(requests),
        offers_count=len(offers),
        deals_count=len(deals),
        listings=listings[:24],
        requests=requests[:24],
        offers=offers[:24],
    )


def get_profile_summary(db: Session, user: User) -> ProfileSummary:
    return _build_summary(db, user)


def update_profile(db: Session, user: User, payload: ProfileUpdate) -> ProfileSummary:
    data = payload.model_dump(exclude_unset=True)
    updated = users_crud.update_user_profile(db, user, **data)
    return _build_summary(db, updated)


def get_public_profile(db: Session, user_id: UUID) -> PublicProfile:
    """Dışarıdan görülebilir profil; hassas alanlar ve pasif ilanlar hariç."""
    user = users_crud.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    active_listings = listings_crud.list_active_listings_by_owner(db, user.id)
    return PublicProfile(
        user_id=user.id,
        name=user.name,
        location=user.location,
        bio=user.bio,
        instagram=user.instagram,
        linkedin=user.linkedin,
        avatar_base64=user.avatar_base64,
        cover_base64=user.cover_base64,
        listings_count=len(active_listings),
        listings=active_listings[:24],
    )
