from datetime import datetime
from typing import Self
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


def _normalize_phone(raw: str) -> str:
    """Türkiye cep: son 10 hane, 5 ile başlamalı (users.phone ile uyumlu)."""
    digits = "".join(c for c in raw if c.isdigit())
    if len(digits) < 10:
        raise ValueError("phone_digits")
    core = digits[-10:]
    if not core.startswith("5"):
        raise ValueError("phone_prefix")
    return core


class UserCreate(BaseModel):
    email: EmailStr | None = None
    phone: str | None = Field(default=None, min_length=10, max_length=32)
    password: str = Field(min_length=6, max_length=256)

    @model_validator(mode="after")
    def require_email_or_phone(self) -> Self:
        if self.email is None and (self.phone is None or not str(self.phone).strip()):
            raise ValueError("En az biri gerekli: email veya phone.")
        return self

    def normalized_email(self) -> str | None:
        if self.email is None:
            return None
        return str(self.email).strip().lower()

    def normalized_phone(self) -> str | None:
        if self.phone is None or not str(self.phone).strip():
            return None
        return _normalize_phone(self.phone)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str | None
    phone: str | None
    created_at: datetime
