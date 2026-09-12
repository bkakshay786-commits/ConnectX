"""Profile SQLAlchemy ORM Model."""

from datetime import datetime, timezone
import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    display_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    banner_url: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    bio: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    website: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    location: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )
    pronouns: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )
    account_visibility: Mapped[str] = mapped_column(
        String(20),
        default="public",
        nullable=False,
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="profile",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Profile user_id={self.id} display_name='{self.display_name}'>"
