from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class WalletRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    balance: Decimal
    currency: str
    updated_at: datetime


class WalletTransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    wallet_id: UUID
    type: str
    amount: Decimal
    status: str
    external_ref: str | None
    created_at: datetime


class WalletSummary(BaseModel):
    wallet: WalletRead
    transactions: list[WalletTransactionRead]


class DepositCreate(BaseModel):
    amount: float = Field(gt=0, le=500_000)
    payment_reference: str | None = Field(default=None, max_length=120)
    provider: str = Field(default="simulated", pattern="^(simulated|iyzico)$")


class DepositResponse(BaseModel):
    wallet: WalletRead | None = None
    mode: str
    message: str
    checkout_url: str | None = None
    payment_token: str | None = None


class IyzicoCompleteRequest(BaseModel):
    payment_token: str = Field(min_length=8, max_length=120)
    amount: float = Field(gt=0, le=500_000)


class WithdrawCreate(BaseModel):
    amount: float = Field(gt=0)
    iban: str = Field(min_length=15, max_length=34)
