from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from crud import item_requests as item_requests_crud
from crud import offers as offers_crud
from crud import rental_deals as deals_crud
from models import ItemRequest, Offer, RentalDeal, User
from schemas.offers import OfferCreate
from services import escrow as escrow_service


def get_item_request(db: Session, request_id: UUID) -> ItemRequest:
    row = item_requests_crud.get_item_request_by_id(db, request_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Talep ilanı bulunamadı.")
    return row


def create_offer(
    db: Session, *, request_id: UUID, supplier: User, body: OfferCreate
) -> Offer:
    req = get_item_request(db, request_id)
    if req.status != "open":
        raise HTTPException(status_code=400, detail="Bu talep artık teklif almıyor.")
    if req.requester_id == supplier.id:
        raise HTTPException(status_code=400, detail="Kendi talebinize teklif veremezsiniz.")
    price = Decimal(str(body.price_amount)).quantize(Decimal("0.01"))
    return offers_crud.create_offer(
        db,
        item_request_id=request_id,
        supplier_id=supplier.id,
        price_amount=price,
        description=body.description.strip(),
    )


def list_offers(db: Session, request_id: UUID) -> list[Offer]:
    get_item_request(db, request_id)
    return offers_crud.list_offers_for_request(db, request_id)


def accept_offer(
    db: Session, *, request_id: UUID, offer_id: UUID, requester: User
) -> RentalDeal:
    req = get_item_request(db, request_id)
    if req.requester_id != requester.id:
        raise HTTPException(status_code=403, detail="Yalnızca talep sahibi teklif kabul edebilir.")
    if req.status != "open":
        raise HTTPException(status_code=400, detail="Bu talep zaten kapatılmış.")

    offer = offers_crud.get_offer_by_id(db, offer_id)
    if offer is None or offer.item_request_id != request_id:
        raise HTTPException(status_code=404, detail="Teklif bulunamadı.")
    if offer.status != "pending":
        raise HTTPException(status_code=400, detail="Bu teklif artık kabul edilemez.")

    deal = deals_crud.create_rental_deal(
        db,
        item_request_id=request_id,
        accepted_offer_id=offer_id,
    )
    deal = deals_crud.get_deal_by_id(db, deal.id)
    if deal is None:
        raise HTTPException(status_code=500, detail="Kiralama kaydı oluşturulamadı.")

    try:
        escrow_service.lock_funds_for_deal(db, deal=deal, payer=requester)
    except HTTPException:
        db.rollback()
        raise

    offer.status = "accepted"
    for other in offers_crud.list_pending_offers_for_request(db, request_id):
        if other.id != offer_id:
            other.status = "rejected"
    req.status = "closed"
    db.commit()
    db.refresh(deal)
    return deal
