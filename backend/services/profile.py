from sqlalchemy.orm import Session

from crud import item_requests as requests_crud
from crud import listings as listings_crud
from crud import offers as offers_crud
from crud import rental_deals as deals_crud
from models import User
from schemas.profile import ProfileSummary


def get_profile_summary(db: Session, user: User) -> ProfileSummary:
    listings = listings_crud.list_listings_by_owner(db, user.id)
    requests = requests_crud.list_item_requests_by_requester(db, user.id)
    offers = offers_crud.list_offers_by_supplier(db, user.id)
    deals = deals_crud.list_deals_for_user(db, user.id)

    return ProfileSummary(
        user_id=user.id,
        email=user.email,
        phone=user.phone,
        listings_count=len(listings),
        requests_count=len(requests),
        offers_count=len(offers),
        deals_count=len(deals),
        listings=listings[:24],
        requests=requests[:24],
        offers=offers[:24],
    )
