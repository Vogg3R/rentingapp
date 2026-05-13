from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from crud import listings as listings_crud
from crud import users as users_crud
from models import Listing
from schemas.listings import ListingCreate


def create_listing(db: Session, body: ListingCreate) -> Listing:
    owner = users_crud.get_user_by_id(db, body.owner_id)
    if owner is None:
        raise HTTPException(status_code=400, detail="Geçersiz sahip (owner_id) kullanıcı bulunamadı.")

    if body.max_days < body.min_days:
        raise HTTPException(
            status_code=400,
            detail="Maksimum kiralama süresi, minimum süreden küçük olamaz.",
        )

    price = Decimal(str(body.daily_price))
    return listings_crud.create_listing(
        db,
        owner_id=body.owner_id,
        title=body.title.strip(),
        description=body.description.strip(),
        category=body.category.strip(),
        daily_price=price,
        min_days=body.min_days,
        max_days=body.max_days,
        location=body.location.strip(),
    )


def list_listings(db: Session) -> list[Listing]:
    return listings_crud.list_listings(db)
