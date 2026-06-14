from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from deps import get_current_user, get_db
from models import User
from schemas.deals import RentalDealRead
from schemas.offers import OfferCreate, OfferRead
from schemas.requests import ItemRequestCreate, ItemRequestRead
from services import item_requests as item_requests_service
from services import offers as offers_service

router = APIRouter()


@router.post("", response_model=ItemRequestRead, status_code=201)
def create_request(
    body: ItemRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ItemRequestRead:
    return item_requests_service.create_item_request(db, current_user, body)


@router.get("", response_model=list[ItemRequestRead])
def get_requests(db: Session = Depends(get_db)) -> list[ItemRequestRead]:
    return item_requests_service.list_item_requests(db)


@router.get("/{request_id}", response_model=ItemRequestRead)
def get_request(request_id: UUID, db: Session = Depends(get_db)) -> ItemRequestRead:
    return offers_service.get_item_request(db, request_id)


@router.delete("/{request_id}")
def delete_request(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Talep sahibi kendi istek ilanını kalıcı olarak siler."""
    item_requests_service.delete_item_request(db, request_id, current_user)
    return {"message": "İstek ilanı başarıyla silindi."}


@router.post("/{request_id}/offers", response_model=OfferRead, status_code=201)
def create_offer(
    request_id: UUID,
    body: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OfferRead:
    return offers_service.create_offer(db, request_id=request_id, supplier=current_user, body=body)


@router.get("/{request_id}/offers", response_model=list[OfferRead])
def list_request_offers(request_id: UUID, db: Session = Depends(get_db)) -> list[OfferRead]:
    return offers_service.list_offers(db, request_id)


@router.post(
    "/{request_id}/offers/{offer_id}/accept",
    response_model=RentalDealRead,
)
def accept_offer(
    request_id: UUID,
    offer_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RentalDealRead:
    return offers_service.accept_offer(
        db,
        request_id=request_id,
        offer_id=offer_id,
        requester=current_user,
    )
