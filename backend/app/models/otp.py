"""OTP Verification SQLAlchemy ORM Model."""

from datetime import datetime, timezone
import uuid
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Integer, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class OtpVerification(Base):
    __tablename__ = "otp_verifications"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )
    identifier: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )
    code_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    purpose: Mapped[str] = mapped_column(
        String(50),
        default="login",
        nullable=False,
    )
    is_consumed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    attempts: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<OtpVerification identifier='{self.identifier}' purpose='{self.purpose}' consumed={self.is_consumed}>"
