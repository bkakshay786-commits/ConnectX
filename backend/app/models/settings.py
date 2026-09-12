"""UserSettings SQLAlchemy ORM Model."""

from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    # Notifications Settings
    pause_all_notifications: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    notify_likes: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    notify_comments: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    notify_spaces: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    notify_files: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    notify_messages: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Appearance Settings
    theme_mode: Mapped[str] = mapped_column(
        String(20),
        default="obsidian",
        nullable=False,
    )
    accent_color: Mapped[str] = mapped_column(
        String(20),
        default="violet",
        nullable=False,
    )
    glow_effects: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Privacy & Interaction Settings
    allow_search_engines: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    read_receipts: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    message_requests: Mapped[str] = mapped_column(
        String(20),
        default="following",
        nullable=False,
    )
    story_replies: Mapped[str] = mapped_column(
        String(20),
        default="everyone",
        nullable=False,
    )
    hide_offensive_words: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
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
        back_populates="settings",
    )

    def __repr__(self) -> str:
        return f"<UserSettings user_id={self.id} theme={self.theme_mode}>"
