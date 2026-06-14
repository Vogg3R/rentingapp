from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from decimal import Decimal

from models import (
    ItemRequest,
    Listing,
    ListingMessage,
    ListingRentalRequest,
    Message,
    Offer,
    RentalDeal,
    User,
    Wallet,
)


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    return db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()


def list_users(db: Session) -> list[User]:
    """Admin paneli için tüm kullanıcılar (en yeni kayıt en üstte)."""
    return list(
        db.execute(select(User).order_by(User.created_at.desc())).scalars()
    )


def delete_user(db: Session, user: User) -> None:
    """Kullanıcıyı siler (cüzdanı ORM cascade ile birlikte gider)."""
    db.delete(user)
    db.commit()


def delete_user_with_content(db: Session, user: User) -> None:
    """
    Kullanıcıyı ve sahip olduğu tüm içerikleri (ilan, talep, teklif, kiralama
    işlemi, mesajlar, cüzdan) bağımlılık sırasına göre siler.

    Sıralama önemlidir: RESTRICT yabancı anahtarları yüzünden önce bağımlı
    kayıtlar (önce kiralama işlemleri) silinmeli. Her adımda flush ile
    veritabanı seviyesinde sıra korunur.
    """
    uid = user.id

    # 1) Kullanıcının taraf olduğu kiralama işlemleri (requester ya da supplier).
    #    Deal silinince mesaj kanalı + mesajlar ORM cascade ile gider ve
    #    item_request/accepted_offer üzerindeki RESTRICT kilidi açılır.
    deals = (
        db.execute(
            select(RentalDeal)
            .join(ItemRequest, RentalDeal.item_request_id == ItemRequest.id)
            .join(Offer, RentalDeal.accepted_offer_id == Offer.id)
            .where((ItemRequest.requester_id == uid) | (Offer.supplier_id == uid))
        )
        .unique()
        .scalars()
        .all()
    )
    for deal in deals:
        db.delete(deal)
    db.flush()

    # 2) Kullanıcının gönderdiği deal mesajları (1. adımda büyük olasılıkla
    #    cascade ile gitti; kalan olursa diye güvenlik amaçlı temizlik).
    for msg in db.execute(select(Message).where(Message.sender_id == uid)).scalars().all():
        db.delete(msg)
    db.flush()

    # 3) Kullanıcının gönderdiği ilan-sohbet mesajları.
    for lmsg in (
        db.execute(select(ListingMessage).where(ListingMessage.sender_id == uid))
        .scalars()
        .all()
    ):
        db.delete(lmsg)
    db.flush()

    # 4) Kullanıcının kiracı olduğu ilan kiralama talepleri (conversation + mesaj cascade).
    for rr in (
        db.execute(
            select(ListingRentalRequest).where(ListingRentalRequest.renter_id == uid)
        )
        .scalars()
        .all()
    ):
        db.delete(rr)
    db.flush()

    # 5) Kullanıcının ilanları (rental_requests + conversation + mesajlar cascade).
    for listing in db.execute(select(Listing).where(Listing.owner_id == uid)).scalars().all():
        db.delete(listing)
    db.flush()

    # 6) Kullanıcının verdiği teklifler (kabul edilenlerin deal'i 1. adımda silindi).
    for offer in db.execute(select(Offer).where(Offer.supplier_id == uid)).scalars().all():
        db.delete(offer)
    db.flush()

    # 7) Kullanıcının istek ilanları (üzerindeki diğer teklifler cascade ile gider).
    for req in (
        db.execute(select(ItemRequest).where(ItemRequest.requester_id == uid))
        .scalars()
        .all()
    ):
        db.delete(req)
    db.flush()

    # 8) Son olarak kullanıcı (cüzdan + cüzdan hareketleri cascade ile gider).
    db.delete(user)
    db.commit()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()


def get_user_by_phone(db: Session, phone: str) -> User | None:
    return db.execute(select(User).where(User.phone == phone)).scalar_one_or_none()


def update_user_profile(
    db: Session,
    user: User,
    *,
    name: str | None = None,
    location: str | None = None,
    bio: str | None = None,
    instagram: str | None = None,
    linkedin: str | None = None,
    avatar_base64: str | None = None,
    cover_base64: str | None = None,
) -> User:
    if name is not None:
        user.name = name.strip() or None
    if location is not None:
        user.location = location.strip() or None
    if bio is not None:
        user.bio = bio.strip() or None
    if instagram is not None:
        user.instagram = instagram.strip() or None
    if linkedin is not None:
        user.linkedin = linkedin.strip() or None
    if avatar_base64 is not None:
        user.avatar_base64 = avatar_base64.strip() or None
    if cover_base64 is not None:
        user.cover_base64 = cover_base64.strip() or None
    db.commit()
    db.refresh(user)
    return user


def create_user(
    db: Session,
    *,
    email: str | None,
    phone: str | None,
    password_hash: str,
    name: str | None = None,
) -> User:
    user = User(
        email=email,
        phone=phone,
        password_hash=password_hash,
        name=name.strip() if name and name.strip() else None,
    )
    db.add(user)
    db.flush()
    db.add(Wallet(user_id=user.id, balance=Decimal("0")))
    db.commit()
    db.refresh(user)
    return user
