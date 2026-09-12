"""Tests for SQLAlchemy 2.x Database Configuration and Session Management."""

# pyrefly: ignore [missing-import]
import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import check_database_connection, engine


def test_settings_loaded():
    """Verify environment variables and settings configuration."""
    assert settings.PROJECT_NAME == "ConnectX Universal Social Ecosystem"
    assert settings.API_V1_STR == "/api/v1"
    assert settings.POSTGRES_DB == "connectx"
    assert settings.DB_POOL_SIZE == 20
    assert settings.DB_MAX_OVERFLOW == 10
    assert settings.is_sqlite is True  # In test environment


@pytest.mark.asyncio
async def test_database_connection_check():
    """Verify check_database_connection() returns healthy on an active engine."""
    status = await check_database_connection()
    assert status["connected"] is True
    assert status["status"] == "healthy"
    assert status["dialect"] in ("sqlite", "postgresql")


@pytest.mark.asyncio
async def test_session_execute_query(db_session: AsyncSession):
    """Verify async session can execute raw queries and transactions."""
    result = await db_session.execute(text("SELECT 42 AS result"))
    scalar = result.scalar()
    assert scalar == 42
