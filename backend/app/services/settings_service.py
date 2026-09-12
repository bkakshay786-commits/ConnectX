"""UserSettings Management Business Logic Service."""

import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.settings import UserSettings
from app.schemas.settings import UserSettingsUpdateRequest


async def get_user_settings(db: AsyncSession, user_id: uuid.UUID) -> UserSettings:
    """Retrieve settings for user, provisioning defaults if missing."""
    stmt = select(UserSettings).where(UserSettings.id == user_id)
    settings = (await db.execute(stmt)).scalar_one_or_none()

    if not settings:
        settings = UserSettings(
            id=user_id,
            pause_all_notifications=False,
            notify_likes=True,
            notify_comments=True,
            notify_spaces=True,
            notify_files=True,
            notify_messages=True,
            theme_mode="obsidian",
            accent_color="violet",
            glow_effects=True,
        )
        db.add(settings)
        await db.commit()
        await db.refresh(settings)

    return settings


async def update_user_settings(
    db: AsyncSession,
    user_id: uuid.UUID,
    updates: UserSettingsUpdateRequest,
) -> UserSettings:
    """Update settings for the user."""
    settings = await get_user_settings(db, user_id)

    update_dict = updates.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(settings, field, value)

    await db.commit()
    await db.refresh(settings)
    return settings
