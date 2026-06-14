from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from deps import get_db
from jwt_tokens import create_access_token, create_refresh_token, decode_refresh_token
from schemas.auth import GoogleAuthRequest, LoginRequest, RefreshRequest, RegisterRequest
from services import accounts as accounts_service
from services.accounts import InvalidContactError, RegisterConflictError
from services.google_auth import verify_google_id_token

router = APIRouter(prefix="/auth", tags=["Auth"])


def _auth_tokens(user) -> dict:
    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer",
        "user": accounts_service.auth_user_payload(user),
    }


@router.post("/register")
def auth_register(body: RegisterRequest, db: Session = Depends(get_db)):
    """E-posta veya telefon + şifre; veritabanında bcrypt ile saklanır."""
    try:
        user = accounts_service.register_with_contact_string(db, body.contact, body.password)
    except InvalidContactError:
        raise HTTPException(
            status_code=400,
            detail="Geçerli bir e-posta veya 10 haneli cep telefonu gerekli (5 ile başlamalı).",
        ) from None
    except RegisterConflictError:
        raise HTTPException(
            status_code=409,
            detail="Bu e-posta veya telefon numarası zaten kayıtlı.",
        ) from None
    return _auth_tokens(user)


@router.post("/login")
def auth_login(body: LoginRequest, db: Session = Depends(get_db)):
    """Kayıtlı kullanıcı: e-posta veya telefon + şifre (PostgreSQL + bcrypt)."""
    user, code = accounts_service.authenticate_with_identifier(
        db, body.identifier, body.password
    )
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
    return _auth_tokens(user)


@router.post("/google")
def auth_google(body: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Google id_token ile giriş veya otomatik üyelik."""
    profile = verify_google_id_token(body.credential)
    user = accounts_service.login_or_register_with_google(
        db,
        email=profile["email"],
        name=profile.get("name"),
    )
    return _auth_tokens(user)


@router.post("/refresh")
def auth_refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    from crud import users as users_crud

    user_id = decode_refresh_token(body.refresh_token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş refresh token.")
    user = users_crud.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı.")
    return _auth_tokens(user)
