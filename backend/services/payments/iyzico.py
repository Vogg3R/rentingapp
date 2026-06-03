"""
Iyzico sandbox entegrasyonu (opsiyonel).

Ortam değişkenleri:
  IYZICO_API_KEY, IYZICO_SECRET_KEY
  IYZICO_BASE_URL (varsayılan: sandbox-api.iyzipay.com)

Anahtarlar yoksa uygulama simülasyon moduna düşer.
"""

from __future__ import annotations

import os
import uuid
from decimal import Decimal

import httpx

IYZICO_API_KEY = os.getenv("IYZICO_API_KEY", "").strip()
IYZICO_SECRET_KEY = os.getenv("IYZICO_SECRET_KEY", "").strip()
IYZICO_BASE_URL = os.getenv("IYZICO_BASE_URL", "https://sandbox-api.iyzipay.com").rstrip("/")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")


def is_configured() -> bool:
    return bool(IYZICO_API_KEY and IYZICO_SECRET_KEY)


def create_checkout_placeholder(
    *,
    amount: Decimal,
    user_id: str,
    conversation_id: str,
) -> dict:
    """
    Tam Checkout Form Initialize yerine MVP: yapılandırma doğrulaması + ödeme sayfası URL şablonu.
    Gerçek entegrasyonda iyzipay SDK ile CheckoutFormInitialize çağrılır.
    """
    if not is_configured():
        return {
            "configured": False,
            "message": "Iyzico anahtarları tanımlı değil; simülasyon modu kullanın.",
        }

    # Sandbox bağlantı kontrolü (ping benzeri — 404 bile yapılandırma var demektir)
    try:
        httpx.get(f"{IYZICO_BASE_URL}", timeout=5.0)
    except httpx.HTTPError:
        pass

    payment_token = f"iyzico-mvp-{uuid.uuid4().hex[:16]}"
    return {
        "configured": True,
        "provider": "iyzico",
        "conversation_id": conversation_id,
        "payment_token": payment_token,
        "amount": str(amount),
        "checkout_url": f"{FRONTEND_URL}/cuzdan?iyzico_token={payment_token}&amount={amount}",
        "message": (
            "Iyzico sandbox yapılandırıldı. MVP: ödeme tamamlamak için "
            "POST /wallet/deposit/iyzico/complete ile payment_token gönderin "
            "(gerçek üretimde Iyzico callback/webhook kullanılır)."
        ),
    }
