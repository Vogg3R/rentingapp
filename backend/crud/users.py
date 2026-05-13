from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from models import User


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    return db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()


def get_user_by_phone(db: Session, phone: str) -> User | None:
    return db.execute(select(User).where(User.phone == phone)).scalar_one_or_none()


def create_user(
    db: Session,
    *,
    email: str | None,
    phone: str | None,
    password_hash: str,
) -> User:
    user = User(email=email, phone=phone, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
