from contextlib import asynccontextmanager
import logging
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env", override=True)

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import apply_schema_patches, engine
from deps import get_db
from routers.admin import router as admin_router
from routers.ai import router as ai_router
from routers.auth import router as auth_router
from routers.deals import router as deals_router
from routers.listings import router as listings_router
from routers.profile import router as profile_router
from routers.requests import router as requests_router
from routers.wallet import router as wallet_router
from schemas.users import UserCreate, UserResponse
from services import accounts as accounts_service
from services import home_feed
from services.accounts import RegisterConflictError

logger = logging.getLogger("uvicorn.access")


@asynccontextmanager
async def lifespan(app: FastAPI):
    import models  # noqa: F401

    models.Base.metadata.create_all(bind=engine)
    apply_schema_patches()
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
app.include_router(wallet_router, prefix="/wallet", tags=["Wallet"])
app.include_router(deals_router, prefix="/deals", tags=["Deals"])
app.include_router(profile_router, prefix="/profile", tags=["Profile"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(ai_router, prefix="/ai", tags=["AI Assistant"])
app.include_router(auth_router)


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
