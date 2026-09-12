"""ConnectX Database Engine and Session Management.

SQLAlchemy 2.x Async Engine and Session configuration for PostgreSQL with asyncpg.
Includes health check verification and dependency injection support.
"""

from typing import AsyncGenerator, Dict, Any
import logging
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings

logger = logging.getLogger("connectx.database")


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy 2.x declarative models."""
    pass


def get_engine_kwargs() -> Dict[str, Any]:
    """Build engine kwargs dynamically based on database type."""
    if settings.is_sqlite:
        return {
            "echo": settings.DB_ECHO,
            "poolclass": NullPool,
            "connect_args": {"check_same_thread": False},
        }
    return {
        "echo": settings.DB_ECHO,
        "pool_size": settings.DB_POOL_SIZE,
        "max_overflow": settings.DB_MAX_OVERFLOW,
        "pool_timeout": settings.DB_POOL_TIMEOUT,
        "pool_recycle": settings.DB_POOL_RECYCLE,
        "pool_pre_ping": True,
    }


def create_engine_instance() -> AsyncEngine:
    """Instantiate the async SQLAlchemy engine."""
    return create_async_engine(
        settings.DATABASE_URL,
        **get_engine_kwargs(),
    )


engine: AsyncEngine = create_engine_instance()

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an async database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_database_connection() -> Dict[str, Any]:
    """Verify live connectivity to the configured database.
    
    Executes a lightweight `SELECT 1` ping and returns connection metadata.
    """
    try:
        async with engine.connect() as connection:
            result = await connection.execute(text("SELECT 1"))
            scalar = result.scalar()
            if scalar == 1:
                return {
                    "status": "healthy",
                    "connected": True,
                    "database": settings.POSTGRES_DB if not settings.is_sqlite else "sqlite_memory",
                    "dialect": engine.dialect.name,
                }
            return {
                "status": "unhealthy",
                "connected": False,
                "error": "Unexpected query return value",
            }
    except Exception as exc:
        logger.error(f"Database connection check failed: {exc}")
        return {
            "status": "unhealthy",
            "connected": False,
            "error": str(exc),
            "dialect": engine.dialect.name,
        }
