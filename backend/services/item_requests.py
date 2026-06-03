from decimal import Decimal

from sqlalchemy.orm import Session

from crud import item_requests as item_requests_crud
from models import ItemRequest, User
from schemas.requests import ItemRequestCreate


def create_item_request(db: Session, requester: User, body: ItemRequestCreate) -> ItemRequest:
    budget = Decimal(str(body.max_daily_budget))
    return item_requests_crud.create_item_request(
        db,
        requester_id=requester.id,
        title=body.title.strip(),
        category=body.category.strip(),
        description=body.description.strip(),
        max_daily_budget=budget,
        duration_days=body.duration_days,
        location=body.location.strip(),
    )


def list_item_requests(db: Session) -> list[ItemRequest]:
    return item_requests_crud.list_item_requests(db)
