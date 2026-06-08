import os
from urllib.parse import quote_plus

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


def _database_url() -> str:
    """
    Öncelik: DATABASE_URL
    Sonra: POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_HOST / POSTGRES_PORT / POSTGRES_DB
    Hiçbiri yoksa: yerel geliştirme için postgres:123456 @ 127.0.0.1 (localhost yerine IPv4;
    bazı kurulumlarda ::1 ile şifre doğrulaması farklı pg_hba satırına düşebilir).
    """
    explicit = os.getenv("DATABASE_URL")
    if explicit:
        return explicit

    password = os.getenv("POSTGRES_PASSWORD")
    if password:
        user = os.getenv("POSTGRES_USER", "postgres")
        host = os.getenv("POSTGRES_HOST", "127.0.0.1")
        port = os.getenv("POSTGRES_PORT", "5432")
        db = os.getenv("POSTGRES_DB", "eldenele_db")
        safe = quote_plus(password)
        return f"postgresql://{user}:{safe}@{host}:{port}/{db}"

    # Yerel varsayılan (şifreyi değiştirdiyseniz DATABASE_URL veya POSTGRES_PASSWORD kullanın)
    return "postgresql://postgres:123456@127.0.0.1:5432/eldenele_db"


SQLALCHEMY_DATABASE_URL = _database_url()

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Tüm ORM modelleri bu tabanı kullanır."""


def apply_schema_patches() -> None:
    """Mevcut PostgreSQL tablolarına yeni sütunları güvenle ekler (create_all ALTER yapmaz)."""
    from sqlalchemy import text

    patches = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(120)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram VARCHAR(64)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_base64 TEXT",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_base64 TEXT",
    ]
    with engine.begin() as conn:
        for sql in patches:
            conn.execute(text(sql))
