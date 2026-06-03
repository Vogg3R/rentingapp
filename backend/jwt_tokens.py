import os
from datetime import UTC, datetime, timedelta
from uuid import UUID

import jwt

JWT_SECRET = os.getenv("JWT_SECRET", "elden-ele-dev-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))
JWT_REFRESH_EXPIRE_DAYS = int(os.getenv("JWT_REFRESH_EXPIRE_DAYS", "30"))


def create_access_token(user_id: UUID) -> str:
    expire = datetime.now(UTC) + timedelta(hours=JWT_EXPIRE_HOURS)
    payload = {"sub": str(user_id), "type": "access", "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: UUID) -> str:
    expire = datetime.now(UTC) + timedelta(days=JWT_REFRESH_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "type": "refresh", "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> UUID | None:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") not in (None, "access"):
            return None
        sub = payload.get("sub")
        if not sub:
            return None
        return UUID(str(sub))
    except (jwt.PyJWTError, ValueError):
        return None


def decode_refresh_token(token: str) -> UUID | None:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        sub = payload.get("sub")
        if not sub:
            return None
        return UUID(str(sub))
    except (jwt.PyJWTError, ValueError):
        return None
