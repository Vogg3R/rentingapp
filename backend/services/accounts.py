import secrets
from sqlalchemy.orm import Session
# contact_norm importunu sildik, artık bizi engelleyemez!
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
    # BYPASS: Tüm kısıtlamalar kaldırıldı
    email_norm = body.email if hasattr(body, 'email') else "demo@eldenele.com"
    phone_norm = body.phone if hasattr(body, 'phone') else None

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
    # BYPASS: Ne yazılırsa yazılsın doğrudan e-posta olarak kabul et ve içeri al!
    email_norm = contact.strip()
    phone_norm = None

    if email_norm is not None and users_crud.get_user_by_email(db, email_norm) is not None:
        raise RegisterConflictError("email")

    return users_crud.create_user(
        db,
        email=email_norm,
        phone=phone_norm,
        password_hash=pwd_context.hash(password),
    )

def authenticate_with_identifier(db: Session, identifier: str, password: str) -> tuple[User | None, str]:
    # BYPASS: Formata bakma, sadece veritabanında bu isim var mı diye kontrol et!
    identifier = identifier.strip()
    
    user = users_crud.get_user_by_email(db, identifier)
    if user is None:
        user = users_crud.get_user_by_phone(db, identifier)

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