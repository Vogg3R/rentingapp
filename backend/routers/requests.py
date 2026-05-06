from fastapi import APIRouter

from schemas.requests import ItemRequestCreate, ItemRequestRead

router = APIRouter()

# MVP: DB yerine bellek içi saklama kullanıyoruz.
_requests: list[ItemRequestRead] = []
_request_id_seq = 1


@router.post("", response_model=ItemRequestRead, status_code=201)
def create_request(body: ItemRequestCreate) -> ItemRequestRead:
    global _request_id_seq
    item_request = ItemRequestRead(id=_request_id_seq, **body.model_dump())
    _requests.append(item_request)
    _request_id_seq += 1
    return item_request


@router.get("", response_model=list[ItemRequestRead])
def get_requests() -> list[ItemRequestRead]:
    return _requests
