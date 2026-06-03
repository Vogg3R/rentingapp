from pydantic import BaseModel, Field


class AIGenerateRequest(BaseModel):
    raw_text: str = Field(min_length=3, max_length=4000)


class AIGenerateResponse(BaseModel):
    title: str
    description: str
    category: str
    daily_price: float = Field(ge=0)
