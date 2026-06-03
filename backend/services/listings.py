from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from crud import listings as listings_crud
from models import Listing, User
from schemas.listings import ListingCreate


def create_listing(db: Session, owner: User, body: ListingCreate) -> Listing:
    if body.max_days < body.min_days:
        raise HTTPException(
            status_code=400,
            detail="Maksimum kiralama süresi, minimum süreden küçük olamaz.",
        )

    price = Decimal(str(body.daily_price))
    return listings_crud.create_listing(
        db,
        owner_id=owner.id,
        title=body.title.strip(),
        description=body.description.strip(),
        category=body.category.strip(),
        daily_price=price,
        min_days=body.min_days,
        max_days=body.max_days,
        location=body.location.strip(),
    )


def get_listing(db: Session, listing_id: UUID) -> Listing:
    row = listings_crud.get_listing_by_id(db, listing_id)
    if row is None:
        raise HTTPException(status_code=404, detail="İlan bulunamadı.")
    return row


def list_listings(
    db: Session,
    *,
    q: str | None = None,
    category: str | None = None,
) -> list[Listing]:
    return listings_crud.list_listings(db, q=q, category=category)
