from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from deps import get_current_user, get_db
from models import User
from schemas.listing_rentals import (
    ListingMessageCreate,
    ListingMessageRead,
    ListingRentalConversationSummary,
    ListingRentalRequestCreate,
    ListingRentalRequestRead,
)
from schemas.listings import ListingCreate, ListingRead
from services import listing_rentals as listing_rentals_service
from services import listings as listings_service

router = APIRouter()


@router.post("", response_model=ListingRead, status_code=201)
def create_listing(
    body: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ListingRead:
    return listings_service.create_listing(db, current_user, body)


@router.get("", response_model=list[ListingRead])
def get_listings(
    q: str | None = Query(default=None, max_length=120),
    category: str | None = Query(default=None, max_length=120),
    db: Session = Depends(get_db),
) -> list[ListingRead]:
    return listings_service.list_listings(db, q=q, category=category)


@router.get("/rental-requests", response_model=list[ListingRentalConversationSummary])
def list_my_listing_rental_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ListingRentalConversationSummary]:
    return listing_rentals_service.list_my_conversations(db, current_user)


@router.get("/rental-requests/{request_id}", response_model=ListingRentalConversationSummary)
def get_listing_rental_conversation(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ListingRentalConversationSummary:
    return listing_rentals_service.get_conversation_summary(db, request_id, current_user)


@router.get("/rental-requests/{request_id}/messages", response_model=list[ListingMessageRead])
def list_listing_rental_messages(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ListingMessageRead]:
    return listing_rentals_service.list_messages(db, request_id, current_user)


@router.post(
    "/rental-requests/{request_id}/messages",
    response_model=ListingMessageRead,
    status_code=201,
)
def send_listing_rental_message(
    request_id: UUID,
    body: ListingMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ListingMessageRead:
    return listing_rentals_service.send_message(db, request_id, current_user, body)


@router.get("/{listing_id}", response_model=ListingRead)
def get_listing(listing_id: UUID, db: Session = Depends(get_db)) -> ListingRead:
    return listings_service.get_listing(db, listing_id)


@router.post(
    "/{listing_id}/rental-requests",
    response_model=ListingRentalRequestRead,
    status_code=201,
)
def create_listing_rental_request(
    listing_id: UUID,
    body: ListingRentalRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ListingRentalRequestRead:
    request = listing_rentals_service.create_rental_request(
        db, listing_id, current_user, body
    )
    conversation_id = request.conversation.id if request.conversation else None
    return ListingRentalRequestRead(
        id=request.id,
        listing_id=request.listing_id,
        renter_id=request.renter_id,
        start_date=request.start_date,
        end_date=request.end_date,
        total_days=request.total_days,
        total_price=request.total_price,
        status=request.status,
        created_at=request.created_at,
        conversation_id=conversation_id,
    )


@router.delete("/{listing_id}")
def delete_listing(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """İlan sahibi kendi ilanını kalıcı olarak siler."""
    listings_service.delete_listing(db, listing_id, current_user)
    return {"message": "İlan başarıyla silindi."}
