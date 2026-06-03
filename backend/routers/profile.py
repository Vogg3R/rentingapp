from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from deps import get_current_user, get_db
from models import User
from schemas.profile import ProfileSummary
from services import profile as profile_service

router = APIRouter()


@router.get("/me", response_model=ProfileSummary)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileSummary:
    return profile_service.get_profile_summary(db, current_user)
