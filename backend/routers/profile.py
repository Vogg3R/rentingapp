from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from deps import get_current_user, get_db
from models import User
from schemas.profile import ProfileSummary, ProfileUpdate, PublicProfile
from services import profile as profile_service

router = APIRouter()


@router.get("/me", response_model=ProfileSummary)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileSummary:
    return profile_service.get_profile_summary(db, current_user)


@router.put("/me", response_model=ProfileSummary)
def update_my_profile(
    body: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileSummary:
    """Kullanıcı profil alanlarını günceller (ad, konum, bio, sosyal linkler)."""
    return profile_service.update_profile(db, current_user, body)


@router.get("/{user_id}", response_model=PublicProfile)
def get_public_profile(user_id: UUID, db: Session = Depends(get_db)) -> PublicProfile:
    """Başka kullanıcının herkese açık profili (auth gerekmez)."""
    return profile_service.get_public_profile(db, user_id)
