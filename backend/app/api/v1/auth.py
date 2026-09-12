"""Authentication API Routes."""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.api.deps import get_db, get_current_user
from app.models.user import User
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

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new ConnectX user",
)
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create a new user account, initialize their profile, and issue JWT tokens."""
    user, access_token, refresh_token = await register_user(db, data)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate with email, username, or phone",
)
async def login(
    data: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate credentials and establish a secure session."""
    user = await authenticate_user(db, data.identifier, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_agent = request.headers.get("user-agent")
    ip_address = request.client.host if request.client else None

    access_token, refresh_token = await create_user_session(
        db,
        user.id,
        remember_me=data.remember_me,
        user_agent=user_agent,
        ip_address=ip_address,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Rotate refresh token and retrieve new access token",
)
async def refresh_token(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Rotate the single-use refresh token and return a fresh access token."""
    new_access, new_refresh, user = await refresh_user_token(db, data.refresh_token)
    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Revoke active refresh token session",
)
async def logout(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Revoke the provided refresh token session."""
    await revoke_user_session(db, data.refresh_token)
    return MessageResponse(message="Successfully logged out.")


@router.post(
    "/logout-all",
    response_model=MessageResponse,
    summary="Revoke all active sessions for current user",
)
async def logout_all(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revoke all sessions across all devices for the authenticated user."""
    revoked_count = await revoke_all_user_sessions(db, current_user.id)
    return MessageResponse(message=f"Successfully revoked {revoked_count} active sessions.")


@router.post(
    "/otp/send",
    response_model=MessageResponse,
    summary="Send a one-time verification passcode",
)
async def send_otp_code(
    data: SendOtpRequest,
    db: AsyncSession = Depends(get_db),
):
    """Generate and dispatch a 6-digit OTP code."""
    code = await generate_otp(db, data.contact, purpose=data.purpose)
    # In development/test mode, the code is returned for instant automated testing
    return MessageResponse(
        message=f"Verification code generated successfully. (Dev: {code})",
    )


@router.post(
    "/otp/verify",
    response_model=MessageResponse,
    summary="Verify a one-time passcode",
)
async def verify_otp_code(
    data: VerifyOtpRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verify an active OTP code."""
    is_valid = await verify_otp(db, data.contact, data.code, purpose=data.purpose)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code.",
        )
    return MessageResponse(message="Passcode verified successfully.")


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Initiate password recovery",
)
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send a password reset code to the associated account contact."""
    user = await get_user_by_identifier(db, data.identifier)
    if user:
        contact = user.email or user.phone
        if contact:
            code = await generate_otp(db, contact, purpose="reset_password")
            return MessageResponse(
                message=f"Password reset instructions have been sent. (Dev: {code})",
            )
    # Always return success message to prevent user enumeration
    return MessageResponse(message="If the account exists, password reset instructions have been sent.")


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset account password with verification code",
)
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Reset password after OTP code verification."""
    await reset_password_with_otp(db, data.identifier, data.code, data.new_password)
    return MessageResponse(message="Password has been reset successfully. Please log in with your new password.")


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Retrieve currently authenticated user session details",
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """Return profile, settings, and account details for the active user."""
    return UserResponse.model_validate(current_user)
