from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from models import ItemRequest, Message, MessageThread, Offer, RentalDeal


def create_rental_deal(
    db: Session,
    *,
    item_request_id: UUID,
    accepted_offer_id: UUID,
) -> RentalDeal:
    deal = RentalDeal(
        item_request_id=item_request_id,
        accepted_offer_id=accepted_offer_id,
        escrow_status="none",
        deal_status="active",
    )
    db.add(deal)
    db.flush()
    thread = MessageThread(rental_deal_id=deal.id)
    db.add(thread)
    db.flush()
    return deal


def get_deal_by_id(db: Session, deal_id: UUID) -> RentalDeal | None:
    return (
        db.execute(
            select(RentalDeal)
            .options(
                joinedload(RentalDeal.item_request),
                joinedload(RentalDeal.accepted_offer).joinedload(Offer.supplier),
                joinedload(RentalDeal.message_thread),
            )
            .where(RentalDeal.id == deal_id)
        )
        .unique()
        .scalar_one_or_none()
    )


def list_deals_for_user(db: Session, user_id: UUID) -> list[RentalDeal]:
    return list(
        db.execute(
            select(RentalDeal)
            .join(ItemRequest, RentalDeal.item_request_id == ItemRequest.id)
            .join(Offer, RentalDeal.accepted_offer_id == Offer.id)
            .options(
                joinedload(RentalDeal.item_request),
                joinedload(RentalDeal.accepted_offer),
            )
            .where(
                (Offer.supplier_id == user_id) | (ItemRequest.requester_id == user_id)
            )
            .order_by(RentalDeal.created_at.desc())
        )
        .unique()
        .scalars()
    )


def list_disputed_deals(db: Session) -> list[RentalDeal]:
    """Admin iade ekranı için anlaşmazlıktaki kiralama işlemleri."""
    return list(
        db.execute(
            select(RentalDeal)
            .options(
                joinedload(RentalDeal.item_request).joinedload(ItemRequest.requester),
                joinedload(RentalDeal.accepted_offer).joinedload(Offer.supplier),
            )
            .where(RentalDeal.deal_status == "disputed")
            .order_by(RentalDeal.created_at.desc())
        )
        .unique()
        .scalars()
    )


def get_thread_for_deal(db: Session, deal_id: UUID) -> MessageThread | None:
    return (
        db.execute(select(MessageThread).where(MessageThread.rental_deal_id == deal_id))
        .scalar_one_or_none()
    )


def list_messages(db: Session, thread_id: UUID) -> list[Message]:
    return list(
        db.execute(
            select(Message)
            .options(joinedload(Message.sender))
            .where(Message.thread_id == thread_id)
            .order_by(Message.created_at.asc())
        ).scalars()
    )


def add_message(db: Session, *, thread_id: UUID, sender_id: UUID, body: str) -> Message:
    row = Message(thread_id=thread_id, sender_id=sender_id, body=body.strip())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
