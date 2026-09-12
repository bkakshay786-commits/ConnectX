"""UserSettings Pydantic Schemas."""

from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class UserSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    # Notifications
    pause_all_notifications: bool = False
    notify_likes: bool = True
    notify_comments: bool = True
    notify_spaces: bool = True
    notify_files: bool = True
    notify_messages: bool = True

    # Appearance
    theme_mode: str = "obsidian"
    accent_color: str = "violet"
    glow_effects: bool = True

    # Privacy & Interactions
    allow_search_engines: bool = False
    read_receipts: bool = True
    message_requests: str = "following"
    story_replies: str = "everyone"
    hide_offensive_words: bool = True

    created_at: datetime
    updated_at: datetime


class UserSettingsUpdateRequest(BaseModel):
    pause_all_notifications: Optional[bool] = None
    notify_likes: Optional[bool] = None
    notify_comments: Optional[bool] = None
    notify_spaces: Optional[bool] = None
    notify_files: Optional[bool] = None
    notify_messages: Optional[bool] = None

    theme_mode: Optional[str] = Field(None, pattern="^(obsidian|midnight|oled)$")
    accent_color: Optional[str] = None
    glow_effects: Optional[bool] = None

    allow_search_engines: Optional[bool] = None
    read_receipts: Optional[bool] = None
    message_requests: Optional[str] = Field(None, pattern="^(everyone|following)$")
    story_replies: Optional[str] = Field(None, pattern="^(everyone|following|off)$")
    hide_offensive_words: Optional[bool] = None
