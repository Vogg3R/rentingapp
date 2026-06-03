from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from crud import wallets as wallets_crud
from models import RentalDeal, User


def lock_funds_for_deal(db: Session, *, deal: RentalDeal, payer: User) -> None:
    """Teklif kabulünde talep edenin cüzdanından escrow kilidi."""
    amount = deal.accepted_offer.price_amount
    wallet = wallets_crud.get_or_create_wallet(db, payer.id)
    if wallet.balance < amount:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Escrow için yetersiz bakiye. Gerekli: ₺{amount}, "
                f"mevcut: ₺{wallet.balance}. Cüzdana yükleme yapın."
            ),
        )
    wallet.balance -= amount
    wallets_crud.add_transaction(
        db,
        wallet_id=wallet.id,
        tx_type="escrow_lock",
        amount=amount,
        status="completed",
        external_ref=str(deal.id),
    )
    deal.escrow_status = "funded"


def release_funds_for_deal(db: Session, *, deal: RentalDeal) -> None:
    """Teslim onayında tedarikçi cüzdanına hakediş."""
    if deal.escrow_status != "funded":
        raise HTTPException(status_code=400, detail="Escrow fonlanmamış veya zaten serbest bırakılmış.")
    amount = deal.accepted_offer.price_amount
    supplier = deal.accepted_offer.supplier
    wallet = wallets_crud.get_or_create_wallet(db, supplier.id)
    wallet.balance += amount
    wallets_crud.add_transaction(
        db,
        wallet_id=wallet.id,
        tx_type="escrow_release",
        amount=amount,
        status="completed",
        external_ref=str(deal.id),
    )
    deal.escrow_status = "released"
