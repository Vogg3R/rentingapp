from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from crud import listing_rentals as rental_crud
from crud import listings as listings_crud
from models import ListingRentalRequest, User
from models import ListingMessage
from schemas.listing_rentals import (
    ListingMessageCreate,
    ListingMessageRead,
    ListingRentalConversationSummary,
    ListingRentalRequestCreate,
)


def _participant(request: ListingRentalRequest, user_id: UUID) -> bool:
    if request.renter_id == user_id:
        return True
    if request.listing.owner_id == user_id:
        return True
    return False


def create_rental_request(
    db: Session,
    listing_id: UUID,
    renter: User,
    body: ListingRentalRequestCreate,
) -> ListingRentalRequest:
    listing = listings_crud.get_listing_by_id(db, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="İlan bulunamadı.")
    if listing.status != "active":
        raise HTTPException(status_code=400, detail="Bu ilan artık aktif değil.")
    if listing.owner_id == renter.id:
        raise HTTPException(status_code=400, detail="Kendi ilanınıza talep gönderemezsiniz.")

    if body.end_date <= body.start_date:
        raise HTTPException(status_code=400, detail="Bitiş tarihi başlangıçtan sonra olmalı.")
    if body.total_days < listing.min_days:
        raise HTTPException(
            status_code=400,
            detail=f"Bu ilan için en az {listing.min_days} gün seçmelisiniz.",
        )
    if body.total_days > listing.max_days:
        raise HTTPException(
            status_code=400,
            detail=f"Bu ilan için en fazla {listing.max_days} gün kiralanabilir.",
        )

    existing = rental_crud.get_pending_request_for_renter(
        db, listing_id=listing_id, renter_id=renter.id
    )
    if existing is not None:
        return existing

    created = rental_crud.create_rental_request(
        db,
        listing_id=listing_id,
        renter_id=renter.id,
        start_date=body.start_date,
        end_date=body.end_date,
        total_days=body.total_days,
        total_price=Decimal(str(body.total_price)),
    )
    reloaded = rental_crud.get_rental_request_by_id(db, created.id)
    return reloaded if reloaded is not None else created


def _to_conversation_summary(
    db: Session, request: ListingRentalRequest, user_id: UUID
) -> ListingRentalConversationSummary:
    listing = request.listing
    is_renter = request.renter_id == user_id
    counterparty = listing.owner if is_renter else request.renter
    last_message = None
    last_message_at = None
    if request.conversation is not None:
        latest = rental_crud.get_last_message(db, request.conversation.id)
        if latest is not None:
            last_message = latest.body
            last_message_at = latest.created_at

    return ListingRentalConversationSummary(
        id=request.id,
        listing_id=request.listing_id,
        listing_title=listing.title,
        counterparty_name=counterparty.name if counterparty else None,
        role="renter" if is_renter else "owner",
        status=request.status,
        total_price=request.total_price,
        total_days=request.total_days,
        start_date=request.start_date,
        end_date=request.end_date,
        last_message=last_message,
        last_message_at=last_message_at,
        created_at=request.created_at,
    )


def list_my_conversations(db: Session, user: User) -> list[ListingRentalConversationSummary]:
    rows = rental_crud.list_requests_for_user(db, user.id)
    return [_to_conversation_summary(db, row, user.id) for row in rows]


def get_conversation_summary(
    db: Session, request_id: UUID, user: User
) -> ListingRentalConversationSummary:
    request = get_rental_request(db, request_id, user)
    return _to_conversation_summary(db, request, user.id)


def get_rental_request(db: Session, request_id: UUID, user: User) -> ListingRentalRequest:
    request = rental_crud.get_rental_request_by_id(db, request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Kiralama talebi bulunamadı.")
    if not _participant(request, user.id):
        raise HTTPException(status_code=403, detail="Bu sohbete erişim yetkiniz yok.")
    return request


def _to_message_read(message: ListingMessage) -> ListingMessageRead:
    sender_name = message.sender.name.strip() if message.sender and message.sender.name else None
    return ListingMessageRead(
        id=message.id,
        conversation_id=message.conversation_id,
        sender_id=message.sender_id,
        sender_name=sender_name,
        body=message.body,
        created_at=message.created_at,
    )


def list_messages(db: Session, request_id: UUID, user: User) -> list[ListingMessageRead]:
    request = get_rental_request(db, request_id, user)
    conversation = request.conversation
    if conversation is None:
        raise HTTPException(status_code=404, detail="Sohbet bulunamadı.")
    rows = rental_crud.list_messages(db, conversation.id)
    return [_to_message_read(row) for row in rows]


def send_message(
    db: Session, request_id: UUID, user: User, body: ListingMessageCreate
) -> ListingMessageRead:
    request = get_rental_request(db, request_id, user)
    conversation = request.conversation
    if conversation is None:
        raise HTTPException(status_code=404, detail="Sohbet bulunamadı.")
    message = rental_crud.add_message(
        db,
        conversation_id=conversation.id,
        sender_id=user.id,
        body=body.body.strip(),
    )
    return _to_message_read(message)
