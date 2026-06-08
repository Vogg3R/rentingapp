from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=1, max_length=256)


class RegisterRequest(BaseModel):
    contact: str = Field(min_length=5, max_length=320)
    password: str = Field(min_length=6, max_length=256)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=10)


class GoogleAuthRequest(BaseModel):
    """Google Identity Services'ten dönen JWT id_token (credential)."""
    credential: str = Field(min_length=20)
