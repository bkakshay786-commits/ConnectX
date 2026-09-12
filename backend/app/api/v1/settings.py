"""UserSettings API Routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.settings import UserSettingsResponse, UserSettingsUpdateRequest
from app.services.settings_service import get_user_settings, update_user_settings

router = APIRouter()


@router.get(
    "/me",
    response_model=UserSettingsResponse,
    summary="Retrieve current user's preferences & privacy settings",
)
async def get_my_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full settings preferences for the authenticated user."""
    settings = await get_user_settings(db, current_user.id)
    return UserSettingsResponse.model_validate(settings)


@router.patch(
    "/me",
    response_model=UserSettingsResponse,
    summary="Update current user's preferences & privacy settings",
)
async def update_my_settings(
    updates: UserSettingsUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update settings (notifications, themes, interaction rules, privacy)."""
    updated = await update_user_settings(db, current_user.id, updates)
    return UserSettingsResponse.model_validate(updated)
