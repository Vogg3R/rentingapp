from contextlib import asynccontextmanager
import logging

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import engine
from deps import get_db
from routers.listings import router as listings_router
from routers.requests import router as requests_router
from schemas.users import UserCreate, UserResponse
from services import accounts as accounts_service
from services import home_feed
from services.accounts import RegisterConflictError

logger = logging.getLogger("uvicorn.access")


@asynccontextmanager
async def lifespan(app: FastAPI):
    import models  # noqa: F401

    models.Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(listings_router, prefix="/listings", tags=["Listings"])
app.include_router(requests_router, prefix="/requests", tags=["Requests"])


@app.post("/users/register", response_model=UserResponse, status_code=201)
def register_user(body: UserCreate, db: Session = Depends(get_db)):
    """Şifreyi bcrypt ile hashleyerek yeni kullanıcı kaydı (PostgreSQL)."""
    logger.info("POST /users/register received (email=%s phone=%s)", body.email, body.phone)
    try:
        user = accounts_service.register_with_user_create(db, body)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Geçerli bir e-posta veya 10 haneli cep telefonu gerekli (5 ile başlamalı).",
        ) from None
    except RegisterConflictError as e:
        if e.field == "email":
            raise HTTPException(status_code=409, detail="Bu e-posta adresi zaten kayıtlı.") from None
        raise HTTPException(status_code=409, detail="Bu telefon numarası zaten kayıtlı.") from None
    return user


@app.get("/")
def read_root(db: Session = Depends(get_db)):
    return home_feed.root_payload(db)


@app.get("/health")
def health():
    """CDN kullanmaz; tarayıcıda ‘yükleniyor’ teşhisi için hızlı kontrol."""
    return {"status": "ok"}


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=1, max_length=256)


class RegisterRequest(BaseModel):
    contact: str = Field(min_length=5, max_length=320)
    password: str = Field(min_length=6, max_length=256)


@app.post("/auth/register")
def auth_register(body: RegisterRequest, db: Session = Depends(get_db)):
    """E-posta veya telefon + şifre; veritabanında bcrypt ile saklanır."""
    try:
        user = accounts_service.register_with_contact_string(db, body.contact, body.password)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Geçerli bir e-posta veya 10 haneli cep telefonu gerekli (5 ile başlamalı).",
        ) from None
    except RegisterConflictError:
        raise HTTPException(
            status_code=409,
            detail="Bu e-posta veya telefon numarası zaten kayıtlı.",
        ) from None
    return {
        "access_token": "mvp-register-token",
        "token_type": "bearer",
        "user": accounts_service.auth_user_payload(user),
    }


@app.post("/auth/login")
def auth_login(body: LoginRequest, db: Session = Depends(get_db)):
    """Kayıtlı kullanıcı: e-posta veya telefon + şifre (PostgreSQL + bcrypt)."""
    user, code = accounts_service.authenticate_with_identifier(db, body.identifier, body.password)
    if code == "invalid_identifier":
        raise HTTPException(
            status_code=400,
            detail="Geçerli bir e-posta veya cep telefonu girin.",
        ) from None
    if code == "not_found":
        raise HTTPException(
            status_code=401,
            detail="Hesap bulunamadı. Önce üye olun.",
        ) from None
    if code == "bad_password":
        raise HTTPException(status_code=401, detail="Şifre hatalı.") from None
    return {
        "access_token": "mvp-login-token",
        "token_type": "bearer",
        "user": accounts_service.auth_user_payload(user),
    }
