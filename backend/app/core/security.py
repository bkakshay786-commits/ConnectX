"""ConnectX Security, Cryptography & JWT Token Management.

Implements Argon2id password hashing and short-lived JWT access tokens
with rotatable refresh tokens.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple, Union
import hashlib
import uuid
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
from jose import JWTError, jwt

from app.core.config import settings

# Initialize Argon2id password hasher with production-grade parameters
pwd_hasher = PasswordHasher(
    time_cost=2,
    memory_cost=65536,  # 64 MB
    parallelism=1,
    hash_len=32,
    salt_len=16,
)

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """Securely hash a plaintext password using Argon2id."""
    return pwd_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against an Argon2id hash."""
    if not hashed_password:
        return False
    try:
        return pwd_hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def hash_token(token: str) -> str:
    """Compute a SHA-256 digest of a token for secure database storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(
    subject: Union[str, uuid.UUID],
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """Create a short-lived signed JWT access token (default 15-30 minutes)."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "type": "access",
        "jti": str(uuid.uuid4()),
    }
    if extra_claims:
        to_encode.update(extra_claims)

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, uuid.UUID],
    expires_delta: Optional[timedelta] = None,
) -> Tuple[str, str]:
    """Create a rotatable refresh token.
    
    Returns:
        tuple of (raw_token, token_hash)
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    token_jti = str(uuid.uuid4())
    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "type": "refresh",
        "jti": token_jti,
    }

    raw_token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    token_digest = hash_token(raw_token)
    return raw_token, token_digest


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT token signature and expiration.
    
    Raises:
        JWTError: if signature is invalid or token has expired.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
