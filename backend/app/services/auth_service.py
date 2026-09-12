"""Authentication & User Provisioning Business Logic Service."""

from datetime import datetime, timedelta, timezone
import random
import uuid
from typing import Optional, Tuple
from sqlalchemy import select, update, or_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from jose import JWTError

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_token,
    decode_token,
)
from app.models.user import User
from app.models.profile import Profile
from app.models.settings import UserSettings
from app.models.session import UserSession
from app.models.otp import OtpVerification
from app.schemas.auth import RegisterRequest


def normalize_username(username: str) -> str:
    """Normalize a username to lowercased alphanumeric + underscore."""
    return username.lower().strip().replace(" ", "_")


async def get_user_by_identifier(db: AsyncSession, identifier: str) -> Optional[User]:
    """Lookup an active user by email, normalized username, or phone number."""
    clean_id = identifier.strip()
    norm_user = normalize_username(clean_id)

    stmt = select(User).where(
        or_(
            User.email == clean_id.lower(),
            User.username_normalized == norm_user,
            User.phone == clean_id,
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def register_user(
    db: AsyncSession,
    data: RegisterRequest,
) -> Tuple[User, str, str]:
    """Provision a new user account with profile and default settings.
    
    Returns:
        tuple of (User, access_token, refresh_token)
    """
    clean_email = data.email.lower().strip()
    norm_username = normalize_username(data.username)

    # Check for duplicate email
    stmt_email = select(User).where(User.email == clean_email)
    existing_email = (await db.execute(stmt_email)).scalar_one_or_none()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    # Check for duplicate username
    stmt_user = select(User).where(User.username_normalized == norm_username)
    existing_username = (await db.execute(stmt_user)).scalar_one_or_none()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This username is already taken.",
        )

    # Create User
    new_user = User(
        id=uuid.uuid4(),
        email=clean_email,
        phone=data.phone.strip() if data.phone else None,
        username=data.username.strip(),
        username_normalized=norm_username,
        hashed_password=hash_password(data.password),
        is_active=True,
        is_verified=False,
    )
    db.add(new_user)
    await db.flush()

    # Create associated Profile
    new_profile = Profile(
        id=new_user.id,
        display_name=data.full_name.strip(),
        avatar_url=data.avatar_url,
        bio=data.bio,
        account_visibility="public",
        is_verified=False,
    )
    db.add(new_profile)

    # Create associated Settings
    new_settings = UserSettings(
        id=new_user.id,
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
    db.add(new_settings)

    await db.commit()
    await db.refresh(new_user)

    # Issue initial tokens & session
    access_token, refresh_token = await create_user_session(db, new_user.id)
    return new_user, access_token, refresh_token


async def authenticate_user(
    db: AsyncSession,
    identifier: str,
    password: str,
) -> Optional[User]:
    """Verify credentials and return active user or None."""
    user = await get_user_by_identifier(db, identifier)
    if not user:
        return None
    if not user.hashed_password:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated.",
        )
    return user


async def create_user_session(
    db: AsyncSession,
    user_id: uuid.UUID,
    remember_me: bool = False,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> Tuple[str, str]:
    """Generate access token and persistent refresh token session."""
    access_token = create_access_token(subject=user_id)

    refresh_days = settings.REFRESH_TOKEN_EXPIRE_DAYS if not remember_me else 30
    expires_delta = timedelta(days=refresh_days)
    refresh_token, token_hash = create_refresh_token(subject=user_id, expires_delta=expires_delta)

    now = datetime.now(timezone.utc)
    session = UserSession(
        id=uuid.uuid4(),
        user_id=user_id,
        refresh_token_hash=token_hash,
        user_agent=user_agent,
        ip_address=ip_address,
        is_revoked=False,
        expires_at=now + expires_delta,
    )
    db.add(session)
    await db.commit()

    return access_token, refresh_token


def ensure_utc(dt: datetime) -> datetime:
    """Ensure datetime has UTC timezone for cross-dialect compatibility."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


async def refresh_user_token(
    db: AsyncSession,
    raw_refresh_token: str,
) -> Tuple[str, str, User]:
    """Rotate refresh token: validate, revoke old session, create new tokens."""
    try:
        payload = decode_token(raw_refresh_token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is not a refresh token.",
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token payload.",
        )

    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid subject.")

    token_digest = hash_token(raw_refresh_token)
    stmt = select(UserSession).where(
        UserSession.user_id == user_uuid,
        UserSession.refresh_token_hash == token_digest,
    )
    session_record = (await db.execute(stmt)).scalar_one_or_none()

    if not session_record or session_record.is_revoked:
        # Possible token reuse/replay attack - revoke all user sessions for safety
        await revoke_all_user_sessions(db, user_uuid)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked or expired.",
        )

    now = datetime.now(timezone.utc)
    if ensure_utc(session_record.expires_at) < now:
        session_record.is_revoked = True
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired.",
        )

    # Revoke old session token
    session_record.is_revoked = True

    # Retrieve User
    user_stmt = select(User).where(User.id == user_uuid, User.is_active == True)
    user = (await db.execute(user_stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    # Issue new rotated token pair
    new_access_token, new_refresh_token = await create_user_session(db, user.id)
    return new_access_token, new_refresh_token, user


async def revoke_user_session(db: AsyncSession, raw_refresh_token: str) -> bool:
    """Revoke a specific refresh token session upon logout."""
    token_digest = hash_token(raw_refresh_token)
    stmt = update(UserSession).where(
        UserSession.refresh_token_hash == token_digest,
    ).values(is_revoked=True)
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount > 0


async def revoke_all_user_sessions(db: AsyncSession, user_id: uuid.UUID) -> int:
    """Revoke all sessions for a given user (security reset / logout-all)."""
    stmt = update(UserSession).where(
        UserSession.user_id == user_id,
        UserSession.is_revoked == False,
    ).values(is_revoked=True)
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount


async def generate_otp(
    db: AsyncSession,
    identifier: str,
    purpose: str = "login",
) -> str:
    """Generate and record a secure 6-digit one-time passcode."""
    clean_id = identifier.strip().lower()
    raw_code = f"{random.randint(100000, 999999)}"
    code_digest = hash_token(raw_code)

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=10)

    otp_entry = OtpVerification(
        id=uuid.uuid4(),
        identifier=clean_id,
        code_hash=code_digest,
        purpose=purpose,
        is_consumed=False,
        attempts=0,
        expires_at=expires_at,
    )
    db.add(otp_entry)
    await db.commit()

    return raw_code


async def verify_otp(
    db: AsyncSession,
    identifier: str,
    code: str,
    purpose: str = "login",
) -> bool:
    """Verify an active 6-digit OTP code."""
    clean_id = identifier.strip().lower()
    code_digest = hash_token(code.strip())

    now = datetime.now(timezone.utc)
    stmt = select(OtpVerification).where(
        OtpVerification.identifier == clean_id,
        OtpVerification.purpose == purpose,
        OtpVerification.is_consumed == False,
    ).order_by(OtpVerification.created_at.desc())

    entry = (await db.execute(stmt)).scalars().first()
    if not entry or ensure_utc(entry.expires_at) < now:
        return False

    entry.attempts += 1
    if entry.attempts > 5:
        entry.is_consumed = True
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed OTP verification attempts.",
        )

    if entry.code_hash == code_digest:
        entry.is_consumed = True
        await db.commit()
        return True

    await db.commit()
    return False


async def reset_password_with_otp(
    db: AsyncSession,
    identifier: str,
    code: str,
    new_password: str,
) -> bool:
    """Verify reset code and update user password."""
    user = await get_user_by_identifier(db, identifier)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found.")

    is_valid = await verify_otp(db, user.email, code, purpose="reset_password")
    if not is_valid and user.phone:
        is_valid = await verify_otp(db, user.phone, code, purpose="reset_password")

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code.",
        )

    user.hashed_password = hash_password(new_password)
    await revoke_all_user_sessions(db, user.id)
    await db.commit()
    return True
