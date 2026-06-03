from fastapi import APIRouter, Depends

from deps import get_current_user
from models import User
from schemas.ai import AIGenerateRequest, AIGenerateResponse
from services import ai_assistant as ai_assistant_service

router = APIRouter()


@router.post("/generate-listing", response_model=AIGenerateResponse)
async def generate_listing(
    body: AIGenerateRequest,
    current_user: User = Depends(get_current_user),
) -> AIGenerateResponse:
    """Oturum açmış kullanıcının ham metnini AI ile ilan alanlarına dönüştürür."""
    _ = current_user  # İleride kullanıcı bazlı kota / log için
    return await ai_assistant_service.generate_listing_from_text(body.raw_text)
