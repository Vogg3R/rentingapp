from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from deps import get_db
from schemas.requests import ItemRequestCreate, ItemRequestRead
from services import item_requests as item_requests_service

router = APIRouter()


@router.post("", response_model=ItemRequestRead, status_code=201)
def create_request(body: ItemRequestCreate, db: Session = Depends(get_db)) -> ItemRequestRead:
    return item_requests_service.create_item_request(db, body)


@router.get("", response_model=list[ItemRequestRead])
def get_requests(db: Session = Depends(get_db)) -> list[ItemRequestRead]:
    return item_requests_service.list_item_requests(db)
