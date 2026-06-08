import os
from pathlib import Path

from dotenv import dotenv_values, load_dotenv
from fastapi import HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

_BACKEND_ROOT = Path(__file__).resolve().parent.parent


def _env_file_candidates() -> list[Path]:
    cwd = Path.cwd()
    return [
        _BACKEND_ROOT / ".env",
        cwd / ".env",
        cwd / "backend" / ".env",
    ]


def _google_client_id() -> str:
    """Uvicorn --reload alt sürecinde os.environ boş kalabiliyor; .env dosyasından da oku."""
    for env_path in _env_file_candidates():
        load_dotenv(env_path, override=True)
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    if client_id:
        return client_id
    for env_path in _env_file_candidates():
        if not env_path.is_file():
            continue
        value = (dotenv_values(env_path).get("GOOGLE_CLIENT_ID") or "").strip()
        if value:
            return value
    return ""


for _path in _env_file_candidates():
    load_dotenv(_path, override=True)


def verify_google_id_token(token: str) -> dict:
    """Google id_token doğrular; e-posta ve ad bilgisini döner."""
    client_id = _google_client_id()
    if not client_id:
        raise HTTPException(
            status_code=503,
            detail="GOOGLE_CLIENT_ID ortam değişkeni tanımlı değil.",
        )

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            client_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=401,
            detail="Google kimlik doğrulaması başarısız.",
        ) from exc

    issuer = idinfo.get("iss")
    if issuer not in ("accounts.google.com", "https://accounts.google.com"):
        raise HTTPException(status_code=401, detail="Geçersiz Google token yayıncısı.")

    if not idinfo.get("email_verified"):
        raise HTTPException(status_code=401, detail="Google e-postası doğrulanmamış.")

    email = idinfo.get("email")
    if not email or not isinstance(email, str):
        raise HTTPException(status_code=401, detail="Google hesabından e-posta alınamadı.")

    return {
        "email": email.strip().lower(),
        "name": idinfo.get("name") if isinstance(idinfo.get("name"), str) else None,
    }
