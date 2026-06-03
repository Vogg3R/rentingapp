from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from deps import get_current_user, get_db
from models import User
from schemas.listings import ListingCreate, ListingRead
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


@router.get("/{listing_id}", response_model=ListingRead)
def get_listing(listing_id: UUID, db: Session = Depends(get_db)) -> ListingRead:
    return listings_service.get_listing(db, listing_id)
