from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from deps import get_db
from schemas.listings import ListingCreate, ListingRead
from services import listings as listings_service

router = APIRouter()


@router.post("", response_model=ListingRead, status_code=201)
def create_listing(body: ListingCreate, db: Session = Depends(get_db)) -> ListingRead:
    return listings_service.create_listing(db, body)


@router.get("", response_model=list[ListingRead])
def get_listings(db: Session = Depends(get_db)) -> list[ListingRead]:
    return listings_service.list_listings(db)
