"""User Pydantic Schemas."""

from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr

from app.schemas.profile import ProfileResponse
from app.schemas.settings import UserSettingsResponse


class UserBase(BaseModel):
    email: EmailStr
    username: str
    phone: Optional[str] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    username: str
    phone: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    profile: Optional[ProfileResponse] = None
    settings: Optional[UserSettingsResponse] = None
