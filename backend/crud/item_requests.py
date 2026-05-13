from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from models import ItemRequest


def create_item_request(
    db: Session,
    *,
    requester_id: UUID,
    title: str,
    category: str,
    description: str,
    max_daily_budget: Decimal,
    duration_days: int,
    location: str,
) -> ItemRequest:
    row = ItemRequest(
        requester_id=requester_id,
        title=title,
        category=category,
        description=description,
        max_daily_budget=max_daily_budget,
        duration_days=duration_days,
        location=location,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def list_item_requests(db: Session) -> list[ItemRequest]:
    return list(
        db.execute(select(ItemRequest).order_by(ItemRequest.created_at.desc())).scalars()
    )
