"""Profile API Routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest
from app.services.profile_service import (
    get_profile_by_username,
    get_profile_by_id,
    update_profile,
)

router = APIRouter()


@router.get(
    "/me",
    response_model=ProfileResponse,
    summary="Retrieve current user's profile",
)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve profile for the authenticated user."""
    profile = await get_profile_by_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")
    
    resp = ProfileResponse.model_validate(profile)
    resp.username = current_user.username
    return resp


@router.patch(
    "/me",
    response_model=ProfileResponse,
    summary="Update current user's profile",
)
async def update_my_profile(
    updates: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update profile attributes (bio, avatar, location, display_name, username, etc.)."""
    profile = await update_profile(db, current_user.id, updates)
    resp = ProfileResponse.model_validate(profile)
    resp.username = updates.username or current_user.username
    return resp


@router.get(
    "/{username}",
    response_model=ProfileResponse,
    summary="Fetch profile by username",
)
async def get_user_profile(
    username: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a public profile by its username."""
    profile = await get_profile_by_username(db, username)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found.")

    resp = ProfileResponse.model_validate(profile)
    resp.username = profile.user.username if profile.user else username
    return resp
