from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from crud import listings as listings_crud


def root_payload(db: Session) -> dict:
    """Kök yanıt: mesaj + (varsa) anasayfa kartları için ilan özeti."""
    base = {
        "mesaj": "P2P Tersine Kiralama API'si Başarıyla Çalışıyor! (Backend'den Selamlar)",
    }
    try:
        rows = listings_crud.list_listings(db)[:24]
    except SQLAlchemyError:
        return base
    if not rows:
        return base
    base["listings"] = [
        {
            "id": str(row.id),
            "title": row.title,
            "imageUrl": f"https://picsum.photos/seed/{row.id.hex[:16]}/800/520",
            "status": "available" if row.status == "active" else "rented",
            "pricePerDay": float(row.daily_price),
        }
        for row in rows
    ]
    return base
