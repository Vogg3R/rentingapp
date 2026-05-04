from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MVP: Bellek içi kullanıcı defteri (sunucu yeniden başlayınca sıfırlanır)
_user_passwords: dict[str, str] = {}


def normalize_contact(raw: str) -> tuple[str, dict]:
    """
    Kayıt / giriş için tek anahtar + API user objesi.
    E-posta: email:lower; telefon: son 10 haneye indirgenmiş phone:...
    """
    s = raw.strip()
    if not s:
        raise ValueError("empty")
    if "@" in s:
        lower = s.lower()
        domain = lower.split("@")[-1]
        if "." not in domain or len(domain) < 2:
            raise ValueError("bad email")
        return f"email:{lower}", {"email": lower, "phone": None}
    digits = "".join(c for c in s if c.isdigit())
    if len(digits) < 10:
        raise ValueError("bad phone")
    core = digits[-10:]
    if not core.startswith("5"):
        raise ValueError("bad phone")
    return f"phone:{core}", {"email": None, "phone": core}


@app.get("/")
def read_root():
    return {"mesaj": "P2P Tersine Kiralama API'si Başarıyla Çalışıyor! (Backend'den Selamlar)"}


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=1, max_length=256)


class RegisterRequest(BaseModel):
    contact: str = Field(min_length=5, max_length=320)
    password: str = Field(min_length=6, max_length=256)


@app.post("/auth/register")
def auth_register(body: RegisterRequest):
    """MVP: İletişim + şifre kaydı; tekrar kayıtta 409."""
    try:
        key, user = normalize_contact(body.contact)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Geçerli bir e-posta veya 10 haneli cep telefonu gerekli (5 ile başlamalı).",
        )
    if key in _user_passwords:
        raise HTTPException(
            status_code=409,
            detail="Bu e-posta veya telefon numarası zaten kayıtlı.",
        )
    _user_passwords[key] = body.password
    return {
        "access_token": "mvp-register-token",
        "token_type": "bearer",
        "user": user,
    }


@app.post("/auth/login")
def auth_login(body: LoginRequest):
    """Kayıtlı kullanıcı: e-posta veya telefon + şifre."""
    try:
        key, user = normalize_contact(body.identifier)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Geçerli bir e-posta veya cep telefonu girin.",
        )
    stored = _user_passwords.get(key)
    if stored is None:
        raise HTTPException(
            status_code=401,
            detail="Hesap bulunamadı. Önce üye olun.",
        )
    if stored != body.password:
        raise HTTPException(status_code=401, detail="Şifre hatalı.")
    return {
        "access_token": "mvp-login-token",
        "token_type": "bearer",
        "user": user,
    }
