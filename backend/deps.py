from collections.abc import Generator
from uuid import UUID

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from crud import users as users_crud
from database import SessionLocal
from jwt_tokens import decode_access_token
from models import User

_bearer = HTTPBearer(auto_error=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _user_from_token(db: Session, token: str | None) -> User | None:
    if not token:
        return None
    # Eski MVP oturumları: sabit token ile çalışmaz; yalnızca JWT.
    user_id = decode_access_token(token)
    if user_id is None:
        return None
    return users_crud.get_user_by_id(db, user_id)


def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> User:
    token = credentials.credentials if credentials else None
    user = _user_from_token(db, token)
    if user is None:
        raise HTTPException(status_code=401, detail="Oturum gerekli. Lütfen giriş yapın.")
    return user


def get_optional_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> User | None:
    token = credentials.credentials if credentials else None
    return _user_from_token(db, token)
