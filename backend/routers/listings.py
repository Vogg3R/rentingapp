from fastapi import APIRouter

from schemas.listings import ListingCreate, ListingRead

router = APIRouter()

# MVP: DB yerine bellek içi saklama kullanıyoruz.
_listings: list[ListingRead] = []
_listing_id_seq = 1


@router.post("", response_model=ListingRead, status_code=201)
def create_listing(body: ListingCreate) -> ListingRead:
    global _listing_id_seq
    listing = ListingRead(id=_listing_id_seq, **body.model_dump())
    _listings.append(listing)
    _listing_id_seq += 1
    return listing


@router.get("", response_model=list[ListingRead])
def get_listings() -> list[ListingRead]:
    return _listings
