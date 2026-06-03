from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from models import Listing


def create_listing(
    db: Session,
    *,
    owner_id: UUID,
    title: str,
    description: str,
    category: str,
    daily_price: Decimal,
    min_days: int,
    max_days: int,
    location: str,
) -> Listing:
    row = Listing(
        owner_id=owner_id,
        title=title,
        description=description,
        category=category,
        daily_price=daily_price,
        min_days=min_days,
        max_days=max_days,
        location=location,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def get_listing_by_id(db: Session, listing_id: UUID) -> Listing | None:
    return (
        db.execute(select(Listing).where(Listing.id == listing_id)).scalar_one_or_none()
    )


def list_listings(
    db: Session,
    *,
    q: str | None = None,
    category: str | None = None,
    owner_id: UUID | None = None,
) -> list[Listing]:
    stmt = select(Listing).order_by(Listing.created_at.desc())
    if owner_id is not None:
        stmt = stmt.where(Listing.owner_id == owner_id)
    if category:
        stmt = stmt.where(Listing.category.ilike(f"%{category.strip()}%"))
    if q:
        pattern = f"%{q.strip()}%"
        stmt = stmt.where(
            (Listing.title.ilike(pattern))
            | (Listing.description.ilike(pattern))
            | (Listing.location.ilike(pattern))
        )
    return list(db.execute(stmt).scalars())


def list_listings_by_owner(db: Session, owner_id: UUID) -> list[Listing]:
    return list_listings(db, owner_id=owner_id)
