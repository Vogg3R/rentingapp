from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from decimal import Decimal

from models import User, Wallet


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    return db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()


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
