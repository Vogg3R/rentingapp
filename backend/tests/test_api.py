from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health_ok():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_request_requires_auth():
    response = client.post(
        "/requests",
        json={
            "title": "Test talep",
            "category": "Elektronik",
            "description": "En az on karakter açıklama metni.",
            "max_daily_budget": 100,
            "duration_days": 3,
            "location": "Lefkoşa",
        },
    )
    assert response.status_code == 401
