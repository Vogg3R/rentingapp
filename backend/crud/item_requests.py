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


def get_item_request_by_id(db: Session, request_id: UUID) -> ItemRequest | None:
    return (
        db.execute(select(ItemRequest).where(ItemRequest.id == request_id))
        .scalar_one_or_none()
    )


def list_item_requests_by_requester(db: Session, requester_id: UUID) -> list[ItemRequest]:
    return list(
        db.execute(
            select(ItemRequest)
            .where(ItemRequest.requester_id == requester_id)
            .order_by(ItemRequest.created_at.desc())
        ).scalars()
    )


def list_item_requests(db: Session, *, status: str | None = None) -> list[ItemRequest]:
    stmt = select(ItemRequest).order_by(ItemRequest.created_at.desc())
    if status is not None:
        stmt = stmt.where(ItemRequest.status == status)
    return list(db.execute(stmt).scalars())
