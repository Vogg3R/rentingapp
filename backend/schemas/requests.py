from pydantic import BaseModel, Field


class ItemRequestCreate(BaseModel):
    title: str = Field(min_length=3, max_length=140)
    category: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=10, max_length=3000)
    max_daily_budget: float = Field(ge=0)
    duration_days: int = Field(ge=1)
    location: str = Field(min_length=2, max_length=255)
    requester_id: str = Field(min_length=1, max_length=120)


class ItemRequestRead(ItemRequestCreate):
    id: int
