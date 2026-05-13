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


def list_listings(db: Session) -> list[Listing]:
    return list(db.execute(select(Listing).order_by(Listing.created_at.desc())).scalars())
