from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from crud import item_requests as item_requests_crud
from crud import listings as listings_crud


def root_payload(db: Session) -> dict:
    """Kök yanıt: mesaj + anasayfa kartları (ilanlar + açık talepler)."""
    base = {
        "mesaj": "P2P Tersine Kiralama API'si Başarıyla Çalışıyor! (Backend'den Selamlar)",
    }
    try:
        listing_rows = listings_crud.list_listings(db)[:24]
        request_rows = item_requests_crud.list_item_requests(db, status="open")[:12]
    except SQLAlchemyError:
        return base

    if listing_rows:
        base["listings"] = [
            {
                "id": str(row.id),
                "title": row.title,
                "imageUrl": f"https://picsum.photos/seed/{row.id.hex[:16]}/800/520",
                "status": "available" if row.status == "active" else "rented",
                "pricePerDay": float(row.daily_price),
            }
            for row in listing_rows
        ]

    if request_rows:
        base["itemRequests"] = [
            {
                "id": str(row.id),
                "title": row.title,
                "maxDailyBudget": float(row.max_daily_budget),
                "durationDays": row.duration_days,
                "location": row.location,
            }
            for row in request_rows
        ]

    return base
