import secrets

from sqlalchemy.orm import Session

from contact_norm import normalize_contact
from crud import users as users_crud
from models import User
from schemas.users import UserCreate
from security import pwd_context


class RegisterConflictError(Exception):
    """E-posta veya telefon zaten kayıtlı."""

    def __init__(self, field: str) -> None:
        self.field = field
        super().__init__(field)


def register_with_user_create(db: Session, body: UserCreate) -> User:
    try:
        email_norm = body.normalized_email()
        phone_norm = body.normalized_phone()
    except ValueError as e:
        raise ValueError("invalid_contact") from e

    if email_norm is not None and users_crud.get_user_by_email(db, email_norm) is not None:
        raise RegisterConflictError("email")
    if phone_norm is not None and users_crud.get_user_by_phone(db, phone_norm) is not None:
        raise RegisterConflictError("phone")

    return users_crud.create_user(
        db,
        email=email_norm,
        phone=phone_norm,
        password_hash=pwd_context.hash(body.password),
    )


def register_with_contact_string(db: Session, contact: str, password: str) -> User:
    try:
        _, surface = normalize_contact(contact)
    except ValueError as e:
        raise ValueError("invalid_contact") from e
    email_norm = surface["email"]
    phone_norm = surface["phone"]

    if email_norm is not None and users_crud.get_user_by_email(db, email_norm) is not None:
        raise RegisterConflictError("email")
    if phone_norm is not None and users_crud.get_user_by_phone(db, phone_norm) is not None:
        raise RegisterConflictError("phone")

    return users_crud.create_user(
        db,
        email=email_norm,
        phone=phone_norm,
        password_hash=pwd_context.hash(password),
    )


def authenticate_with_identifier(db: Session, identifier: str, password: str) -> tuple[User | None, str]:
    """
    Başarı: (user, 'ok')
    Aksi: (None, 'invalid_identifier' | 'not_found' | 'bad_password')
    """
    try:
        _, surface = normalize_contact(identifier.strip())
    except ValueError:
        return None, "invalid_identifier"

    user: User | None = None
    if surface["email"] is not None:
        user = users_crud.get_user_by_email(db, surface["email"])
    elif surface["phone"] is not None:
        user = users_crud.get_user_by_phone(db, surface["phone"])

    if user is None:
        return None, "not_found"
    if not pwd_context.verify(password, user.password_hash):
        return None, "bad_password"
    return user, "ok"


def auth_user_payload(user: User) -> dict:
    """Frontend AuthSessionUser ile uyumlu gövde."""
    return {
        "id": str(user.id),
        "email": user.email,
        "phone": user.phone,
    }


def login_or_register_with_google(
    db: Session,
    *,
    email: str,
    name: str | None,
) -> User:
    """Google OAuth: mevcut kullanıcıyı döner veya güvenli rastgele şifre ile yeni hesap açar."""
    user = users_crud.get_user_by_email(db, email)
    if user is None:
        random_password = secrets.token_urlsafe(32)
        return users_crud.create_user(
            db,
            email=email,
            phone=None,
            password_hash=pwd_context.hash(random_password),
            name=name,
        )

    if name and not user.name:
        users_crud.update_user_profile(db, user, name=name)

    return user
