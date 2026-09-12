"""Profile Pydantic Schemas."""

from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ProfileBase(BaseModel):
    display_name: str = Field(..., min_length=1, max_length=100)
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=1000)
    website: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=100)
    pronouns: Optional[str] = Field(None, max_length=50)
    account_visibility: str = Field("public", pattern="^(public|private)$")


class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = Field(None, min_length=1, max_length=100)
    username: Optional[str] = Field(None, min_length=3, max_length=50, pattern="^[a-zA-Z0-9_.]+$")
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=1000)
    website: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=100)
    pronouns: Optional[str] = Field(None, max_length=50)
    account_visibility: Optional[str] = Field(None, pattern="^(public|private)$")


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: Optional[str] = None
    display_name: str
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    pronouns: Optional[str] = None
    account_visibility: str = "public"
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime
