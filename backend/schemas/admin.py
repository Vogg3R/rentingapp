from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AdminWithdrawalRead(BaseModel):
    """Admin panelinde bekleyen para çekme talebi satırı."""

    id: UUID
    user_id: UUID
    user_name: str | None = None
    amount: Decimal
    # Para çekim taleplerinde IBAN, işlem kaydının external_ref alanında tutulur.
    iban: str | None = None
    created_at: datetime


class AdminUserRead(BaseModel):
    """Admin panelindeki kullanıcı satırı (parola/hassas alan yok)."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    created_at: datetime


class AdminDealRead(BaseModel):
    """Admin panelinde iade edilebilir (anlaşmazlıktaki) kiralama işlemi satırı."""

    id: UUID
    item_request_title: str
    requester_name: str | None = None
    supplier_name: str | None = None
    amount: Decimal
    escrow_status: str
    deal_status: str
    created_at: datetime
