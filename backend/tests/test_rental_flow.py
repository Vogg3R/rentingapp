"""
Uçtan uca kiralama akışı (PostgreSQL gerekir).
CI'da DATABASE_URL ile çalışır; yerelde DB yoksa test atlanır.
"""

import os
import uuid

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

pytestmark = pytest.mark.skipif(
    not os.getenv("DATABASE_URL") and not os.getenv("POSTGRES_PASSWORD"),
    reason="PostgreSQL yapılandırması yok",
)


def _register_and_token(suffix: str) -> tuple[str, str]:
    contact = f"flow{suffix}{uuid.uuid4().hex[:6]}@test.eldenele.local"
    res = client.post(
        "/auth/register",
        json={"contact": contact, "password": "testpass123"},
    )
    assert res.status_code == 200, res.text
    data = res.json()
    return data["user"]["id"], data["access_token"]


def test_full_rental_cycle():
    requester_id, requester_token = _register_and_token("req")
    _, supplier_token = _register_and_token("sup")

    # Talep eden cüzdana yükle
    dep = client.post(
        "/wallet/deposit",
        headers={"Authorization": f"Bearer {requester_token}"},
        json={"amount": 1000, "provider": "simulated"},
    )
    assert dep.status_code == 200, dep.text

    # Talep oluştur
    req = client.post(
        "/requests",
        headers={"Authorization": f"Bearer {requester_token}"},
        json={
            "title": "Test Kamera Kiralama",
            "category": "Fotoğraf",
            "description": "Proje için kısa süreli kamera ihtiyacı var.",
            "max_daily_budget": 200,
            "duration_days": 3,
            "location": "Lefkoşa",
        },
    )
    assert req.status_code == 201, req.text
    request_id = req.json()["id"]

    # Tedarikçi teklif
    offer = client.post(
        f"/requests/{request_id}/offers",
        headers={"Authorization": f"Bearer {supplier_token}"},
        json={"price_amount": 450, "description": "GoPro ve aksesuarlar dahil."},
    )
    assert offer.status_code == 201, offer.text
    offer_id = offer.json()["id"]

    # Kabul + escrow
    accept = client.post(
        f"/requests/{request_id}/offers/{offer_id}/accept",
        headers={"Authorization": f"Bearer {requester_token}"},
    )
    assert accept.status_code == 200, accept.text
    deal_id = accept.json()["id"]

    # Mesaj
    msg = client.post(
        f"/deals/{deal_id}/messages",
        headers={"Authorization": f"Bearer {supplier_token}"},
        json={"body": "Yarın teslim edebilirim."},
    )
    assert msg.status_code == 201, msg.text

    # Teslim onayı
    confirm = client.post(
        f"/deals/{deal_id}/confirm-delivery",
        headers={"Authorization": f"Bearer {requester_token}"},
    )
    assert confirm.status_code == 200, confirm.text
    assert confirm.json()["deal_status"] == "completed"
    assert confirm.json()["escrow_status"] == "released"


def test_refresh_token():
    reg = client.post(
        "/auth/register",
        json={
            "contact": f"refresh{uuid.uuid4().hex[:8]}@test.eldenele.local",
            "password": "testpass123",
        },
    )
    assert reg.status_code == 200
    refresh = reg.json()["refresh_token"]
    refreshed = client.post("/auth/refresh", json={"refresh_token": refresh})
    assert refreshed.status_code == 200
    assert "access_token" in refreshed.json()
    assert "refresh_token" in refreshed.json()
