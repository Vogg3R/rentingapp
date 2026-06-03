import asyncio
import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from fastapi import HTTPException
from google import genai
from google.genai import types

from schemas.ai import AIGenerateResponse

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

GEMINI_MODEL = "gemini-2.5-flash"

SYSTEM_PROMPT = (
    "Sen EldenEle P2P kiralama platformu için profesyonel bir ilan asistanısın. "
    "Gelen metni incele ve sadece JSON formatında başlık, detaylı açıklama, kategori "
    "ve günlük fiyat dön. Ekstra metin yazma. "
    'JSON anahtarları şöyle olmalı: "title", "description", "category", "daily_price". '
    "daily_price sayısal (TRY/gün) olmalı."
)


def _get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not api_key.strip():
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY ortam değişkeni tanımlı değil.",
        )
    return genai.Client(api_key=api_key.strip())


def _clean_json_response(content: str) -> str:
    """response.text içindeki boşluk ve markdown code fence etiketlerini temizler."""
    text = content.strip()
    text = text.replace("```json", "").replace("```JSON", "").replace("```", "")
    text = text.strip()

    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content, re.IGNORECASE)
    if fence_match:
        return fence_match.group(1).strip()

    return text


def _generate_listing_sync(raw_text: str) -> AIGenerateResponse:
    client = _get_client()
    prompt = raw_text.strip()

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_json_schema=AIGenerateResponse.model_json_schema(),
            ),
        )
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Gemini Detaylı Hata: {str(exc)}")
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API isteği başarısız oldu: {str(exc)}",
        ) from exc

    content = getattr(response, "text", None)
    if not content or not content.strip():
        raise HTTPException(status_code=502, detail="Gemini boş yanıt döndürdü.")

    cleaned = _clean_json_response(content)

    try:
        payload = json.loads(cleaned)
        return AIGenerateResponse.model_validate(payload)
    except (json.JSONDecodeError, ValueError) as exc:
        print(f"Gemini Detaylı Hata: {str(exc)}")
        print(f"Gemini Ham Yanıt (temizlenmiş): {cleaned[:500]}")
        raise HTTPException(
            status_code=502,
            detail="Yapay zeka yanıtı geçerli ilan JSON'una dönüştürülemedi.",
        ) from exc


async def generate_listing_from_text(raw_text: str) -> AIGenerateResponse:
    """Dağınık kullanıcı metnini Gemini ile yapılandırılmış ilan alanlarına çevirir."""
    return await asyncio.to_thread(_generate_listing_sync, raw_text.strip())
