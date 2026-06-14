from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from crud import item_requests as item_requests_crud
from models import ItemRequest, User
from schemas.requests import ItemRequestCreate


def create_item_request(db: Session, requester: User, body: ItemRequestCreate) -> ItemRequest:
    budget = Decimal(str(body.max_daily_budget))
    image = body.image_base64.strip() if body.image_base64 else None
    return item_requests_crud.create_item_request(
        db,
        requester_id=requester.id,
        title=body.title.strip(),
        category=body.category.strip(),
        description=body.description.strip(),
        max_daily_budget=budget,
        duration_days=body.duration_days,
        location=body.location.strip(),
        image_base64=image,
    )


def list_item_requests(db: Session) -> list[ItemRequest]:
    return item_requests_crud.list_item_requests(db)


def delete_item_request(db: Session, request_id: UUID, current_user: User) -> None:
    """Yalnızca talep sahibi kendi istek ilanını silebilir."""
    item_request = item_requests_crud.get_item_request_by_id(db, request_id)
    if item_request is None:
        raise HTTPException(status_code=404, detail="İstek ilanı bulunamadı.")
    if item_request.requester_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu istek ilanını silme yetkiniz yok.")
    item_requests_crud.delete_item_request(db, item_request)
