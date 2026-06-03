import uuid
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from crud import wallets as wallets_crud
from models import User, Wallet
from schemas.wallet import (
    DepositCreate,
    DepositResponse,
    IyzicoCompleteRequest,
    WalletRead,
    WalletSummary,
    WithdrawCreate,
)
from services.payments import create_checkout_placeholder, is_configured


def get_wallet_summary(db: Session, user: User) -> WalletSummary:
    wallet = wallets_crud.get_or_create_wallet(db, user.id)
    txs = wallets_crud.list_transactions(db, wallet.id)
    return WalletSummary(wallet=wallet, transactions=txs)


def _apply_deposit(db: Session, user: User, amount: Decimal, external_ref: str) -> Wallet:
    wallet = wallets_crud.get_or_create_wallet(db, user.id)
    wallet.balance += amount
    wallets_crud.add_transaction(
        db,
        wallet_id=wallet.id,
        tx_type="deposit",
        amount=amount,
        status="completed",
        external_ref=external_ref,
    )
    db.commit()
    db.refresh(wallet)
    return wallet


def deposit(db: Session, user: User, body: DepositCreate) -> DepositResponse:
    amount = Decimal(str(body.amount)).quantize(Decimal("0.01"))

    if body.provider == "iyzico":
        if not is_configured():
            raise HTTPException(
                status_code=503,
                detail="Iyzico yapılandırılmamış. IYZICO_API_KEY ve IYZICO_SECRET_KEY ekleyin veya provider=simulated kullanın.",
            )
        conversation_id = str(uuid.uuid4())
        checkout = create_checkout_placeholder(
            amount=amount,
            user_id=str(user.id),
            conversation_id=conversation_id,
        )
        return DepositResponse(
            mode="iyzico_pending",
            message=checkout.get("message", "Ödeme başlatıldı."),
            checkout_url=checkout.get("checkout_url"),
            payment_token=checkout.get("payment_token"),
        )

    ref = body.payment_reference or "mvp-simulated-card"
    wallet = _apply_deposit(db, user, amount, ref)
    return DepositResponse(
        wallet=WalletRead.model_validate(wallet),
        mode="simulated",
        message="Bakiye simülasyon ile yüklendi.",
    )


def complete_iyzico_deposit(db: Session, user: User, body: IyzicoCompleteRequest) -> Wallet:
    if not is_configured():
        raise HTTPException(status_code=503, detail="Iyzico yapılandırılmamış.")
    if not body.payment_token.startswith("iyzico-mvp-"):
        raise HTTPException(status_code=400, detail="Geçersiz ödeme token.")
    amount = Decimal(str(body.amount)).quantize(Decimal("0.01"))
    return _apply_deposit(db, user, amount, body.payment_token)


def withdraw_request(db: Session, user: User, body: WithdrawCreate) -> Wallet:
    wallet = wallets_crud.get_or_create_wallet(db, user.id)
    amount = Decimal(str(body.amount)).quantize(Decimal("0.01"))
    if wallet.balance < amount:
        raise HTTPException(
            status_code=400,
            detail="Yetersiz bakiye. Önce cüzdana yükleme yapın.",
        )
    wallet.balance -= amount
    wallets_crud.add_transaction(
        db,
        wallet_id=wallet.id,
        tx_type="withdrawal",
        amount=amount,
        status="pending",
        external_ref=body.iban.strip(),
    )
    db.commit()
    db.refresh(wallet)
    return wallet
