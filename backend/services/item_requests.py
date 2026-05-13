from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from crud import item_requests as item_requests_crud
from crud import users as users_crud
from models import ItemRequest
from schemas.requests import ItemRequestCreate


def create_item_request(db: Session, body: ItemRequestCreate) -> ItemRequest:
    requester = users_crud.get_user_by_id(db, body.requester_id)
    if requester is None:
        raise HTTPException(
            status_code=400,
            detail="Geçersiz talep sahibi (requester_id) kullanıcı bulunamadı.",
        )

    budget = Decimal(str(body.max_daily_budget))
    return item_requests_crud.create_item_request(
        db,
        requester_id=body.requester_id,
        title=body.title.strip(),
        category=body.category.strip(),
        description=body.description.strip(),
        max_daily_budget=budget,
        duration_days=body.duration_days,
        location=body.location.strip(),
    )


def list_item_requests(db: Session) -> list[ItemRequest]:
    return item_requests_crud.list_item_requests(db)
