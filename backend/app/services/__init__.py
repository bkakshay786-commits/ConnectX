"""Services Package Registration."""

from app.services.auth_service import (
    register_user,
    authenticate_user,
    create_user_session,
    refresh_user_token,
    revoke_user_session,
    revoke_all_user_sessions,
    generate_otp,
    verify_otp,
    reset_password_with_otp,
    get_user_by_identifier,
)
from app.services.profile_service import (
    get_profile_by_username,
    get_profile_by_id,
    update_profile,
)
from app.services.settings_service import (
    get_user_settings,
    update_user_settings,
)

__all__ = [
    "register_user",
    "authenticate_user",
    "create_user_session",
    "refresh_user_token",
    "revoke_user_session",
    "revoke_all_user_sessions",
    "generate_otp",
    "verify_otp",
    "reset_password_with_otp",
    "get_user_by_identifier",
    "get_profile_by_username",
    "get_profile_by_id",
    "update_profile",
    "get_user_settings",
    "update_user_settings",
]
