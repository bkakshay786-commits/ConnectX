"""Schemas Package Registration."""

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    SendOtpRequest,
    VerifyOtpRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
)
from app.schemas.user import UserResponse
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest
from app.schemas.settings import UserSettingsResponse, UserSettingsUpdateRequest

__all__ = [
    "RegisterRequest",
    "LoginRequest",
    "TokenResponse",
    "RefreshTokenRequest",
    "SendOtpRequest",
    "VerifyOtpRequest",
    "ForgotPasswordRequest",
    "ResetPasswordRequest",
    "MessageResponse",
    "UserResponse",
    "ProfileResponse",
    "ProfileUpdateRequest",
    "UserSettingsResponse",
    "UserSettingsUpdateRequest",
]
