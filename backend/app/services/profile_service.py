"""Profile Management Business Logic Service."""

import uuid
from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from sqlalchemy.orm import selectinload

from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import ProfileUpdateRequest
from app.services.auth_service import normalize_username


async def get_profile_by_username(db: AsyncSession, username: str) -> Optional[Profile]:
    """Fetch public profile by username."""
    norm_user = normalize_username(username)
    stmt = (
        select(Profile)
        .options(selectinload(Profile.user))
        .join(User, User.id == Profile.id)
        .where(User.username_normalized == norm_user)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_profile_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[Profile]:
    """Fetch profile by user UUID."""
    stmt = select(Profile).options(selectinload(Profile.user)).where(Profile.id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def update_profile(
    db: AsyncSession,
    user_id: uuid.UUID,
    updates: ProfileUpdateRequest,
) -> Profile:
    """Update profile details and optionally sync username on the User model."""
    profile = await get_profile_by_id(db, user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

    update_dict = updates.model_dump(exclude_unset=True)

    # Handle username update if provided
    if "username" in update_dict and update_dict["username"]:
        new_username = update_dict.pop("username").strip()
        norm_username = normalize_username(new_username)

        # Check for duplicate username
        stmt_dup = select(User).where(
            User.username_normalized == norm_username,
            User.id != user_id,
        )
        existing = (await db.execute(stmt_dup)).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This username is already in use.",
            )

        user_stmt = update(User).where(User.id == user_id).values(
            username=new_username,
            username_normalized=norm_username,
        )
        await db.execute(user_stmt)

    for field, value in update_dict.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile
