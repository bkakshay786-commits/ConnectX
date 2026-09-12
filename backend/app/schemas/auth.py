"""Authentication Pydantic Schemas."""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, pattern="^[a-zA-Z0-9_.]+$")
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=50)
    avatar_url: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=1000)


class LoginRequest(BaseModel):
    identifier: str = Field(..., min_length=3, description="Email, normalized username, or phone number")
    password: str = Field(..., min_length=1)
    remember_me: bool = False


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class SendOtpRequest(BaseModel):
    contact: str = Field(..., min_length=3, description="Email or phone number")
    purpose: str = Field("login", pattern="^(login|signup|reset_password|2fa)$")


class VerifyOtpRequest(BaseModel):
    contact: str = Field(..., min_length=3)
    code: str = Field(..., min_length=4, max_length=10)
    purpose: str = Field("login", pattern="^(login|signup|reset_password|2fa)$")


class ForgotPasswordRequest(BaseModel):
    identifier: str = Field(..., min_length=3, description="Email or username")


class ResetPasswordRequest(BaseModel):
    identifier: str = Field(..., min_length=3)
    code: str = Field(..., min_length=4, max_length=10)
    new_password: str = Field(..., min_length=6, max_length=128)


class MessageResponse(BaseModel):
    success: bool = True
    message: str
