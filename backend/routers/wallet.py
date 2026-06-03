from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from deps import get_current_user, get_db
from models import User
from schemas.wallet import (
    DepositCreate,
    DepositResponse,
    IyzicoCompleteRequest,
    WalletRead,
    WalletSummary,
    WithdrawCreate,
)
from services import wallet as wallet_service

router = APIRouter()


@router.get("/me", response_model=WalletSummary)
def get_my_wallet(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WalletSummary:
    return wallet_service.get_wallet_summary(db, current_user)


@router.post("/deposit", response_model=DepositResponse)
def deposit(
    body: DepositCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DepositResponse:
    """Simülasyon veya Iyzico (anahtarlar tanımlıysa) ile yükleme başlat."""
    return wallet_service.deposit(db, current_user, body)


@router.post("/deposit/iyzico/complete", response_model=WalletRead)
def complete_iyzico_deposit(
    body: IyzicoCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WalletRead:
    return wallet_service.complete_iyzico_deposit(db, current_user, body)


@router.post("/withdraw", response_model=WalletRead)
def withdraw(
    body: WithdrawCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WalletRead:
    return wallet_service.withdraw_request(db, current_user, body)
