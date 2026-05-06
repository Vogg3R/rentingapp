from pydantic import BaseModel, Field


class ListingCreate(BaseModel):
    title: str = Field(min_length=3, max_length=140)
    description: str = Field(min_length=10, max_length=3000)
    category: str = Field(min_length=2, max_length=120)
    daily_price: float = Field(ge=0)
    min_days: int = Field(ge=1)
    max_days: int = Field(ge=1)
    location: str = Field(min_length=2, max_length=255)
    owner_id: str = Field(min_length=1, max_length=120)


class ListingRead(ListingCreate):
    id: int
