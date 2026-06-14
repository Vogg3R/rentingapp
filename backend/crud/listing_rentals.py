from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

from models import Listing, ListingConversation, ListingMessage, ListingRentalRequest


def get_pending_request_for_renter(
    db: Session, *, listing_id: UUID, renter_id: UUID
) -> ListingRentalRequest | None:
    return db.execute(
        select(ListingRentalRequest)
        .options(joinedload(ListingRentalRequest.conversation))
        .where(
            ListingRentalRequest.listing_id == listing_id,
            ListingRentalRequest.renter_id == renter_id,
            ListingRentalRequest.status == "pending",
        )
        .order_by(ListingRentalRequest.created_at.desc())
    ).scalar_one_or_none()


def create_rental_request(
    db: Session,
    *,
    listing_id: UUID,
    renter_id: UUID,
    start_date: date,
    end_date: date,
    total_days: int,
    total_price: Decimal,
) -> ListingRentalRequest:
    request = ListingRentalRequest(
        listing_id=listing_id,
        renter_id=renter_id,
        start_date=start_date,
        end_date=end_date,
        total_days=total_days,
        total_price=total_price,
    )
    db.add(request)
    db.flush()
    conversation = ListingConversation(rental_request_id=request.id)
    db.add(conversation)
    db.commit()
    db.refresh(request)
    return request


def get_rental_request_by_id(db: Session, request_id: UUID) -> ListingRentalRequest | None:
    return db.execute(
        select(ListingRentalRequest)
        .options(
            joinedload(ListingRentalRequest.conversation),
            joinedload(ListingRentalRequest.listing).joinedload(Listing.owner),
            joinedload(ListingRentalRequest.renter),
        )
        .where(ListingRentalRequest.id == request_id)
    ).scalar_one_or_none()


def list_requests_for_user(db: Session, user_id: UUID) -> list[ListingRentalRequest]:
    return list(
        db.execute(
            select(ListingRentalRequest)
            .join(ListingRentalRequest.listing)
            .options(
                joinedload(ListingRentalRequest.conversation),
                joinedload(ListingRentalRequest.listing).joinedload(Listing.owner),
                joinedload(ListingRentalRequest.renter),
            )
            .where(
                or_(
                    ListingRentalRequest.renter_id == user_id,
                    Listing.owner_id == user_id,
                )
            )
            .order_by(ListingRentalRequest.created_at.desc())
        ).scalars()
    )


def update_request_status(
    db: Session, request: ListingRentalRequest, status: str
) -> ListingRentalRequest:
    """Kiralama talebinin durumunu günceller (accepted / rejected vb.)."""
    request.status = status
    db.commit()
    db.refresh(request)
    return request


def get_last_message(db: Session, conversation_id: UUID) -> ListingMessage | None:
    return db.execute(
        select(ListingMessage)
        .where(ListingMessage.conversation_id == conversation_id)
        .order_by(ListingMessage.created_at.desc())
        .limit(1)
    ).scalar_one_or_none()


def list_messages(db: Session, conversation_id: UUID) -> list[ListingMessage]:
    return list(
        db.execute(
            select(ListingMessage)
            .options(joinedload(ListingMessage.sender))
            .where(ListingMessage.conversation_id == conversation_id)
            .order_by(ListingMessage.created_at.asc())
        ).scalars()
    )


def get_message_by_id(db: Session, message_id: UUID) -> ListingMessage | None:
    return db.execute(
        select(ListingMessage)
        .options(joinedload(ListingMessage.sender))
        .where(ListingMessage.id == message_id)
    ).scalar_one_or_none()


def add_message(
    db: Session, *, conversation_id: UUID, sender_id: UUID, body: str
) -> ListingMessage:
    message = ListingMessage(
        conversation_id=conversation_id,
        sender_id=sender_id,
        body=body,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    loaded = get_message_by_id(db, message.id)
    return loaded if loaded is not None else message
