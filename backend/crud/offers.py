from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from models import Offer


def create_offer(
    db: Session,
    *,
    item_request_id: UUID,
    supplier_id: UUID,
    price_amount: Decimal,
    description: str,
) -> Offer:
    row = Offer(
        item_request_id=item_request_id,
        supplier_id=supplier_id,
        price_amount=price_amount,
        description=description,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def get_offer_by_id(db: Session, offer_id: UUID) -> Offer | None:
    return db.execute(select(Offer).where(Offer.id == offer_id)).scalar_one_or_none()


def list_offers_for_request(db: Session, item_request_id: UUID) -> list[Offer]:
    return list(
        db.execute(
            select(Offer)
            .where(Offer.item_request_id == item_request_id)
            .order_by(Offer.created_at.desc())
        ).scalars()
    )


def list_offers_by_supplier(db: Session, supplier_id: UUID) -> list[Offer]:
    return list(
        db.execute(
            select(Offer)
            .where(Offer.supplier_id == supplier_id)
            .order_by(Offer.created_at.desc())
        ).scalars()
    )


def list_pending_offers_for_request(db: Session, item_request_id: UUID) -> list[Offer]:
    return list(
        db.execute(
            select(Offer).where(
                Offer.item_request_id == item_request_id,
                Offer.status == "pending",
            )
        ).scalars()
    )
