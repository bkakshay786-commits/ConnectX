"""ConnectX FastAPI Application Entrypoint.

Configures application lifecycle, CORS middleware, API v1 routing, and health probes.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import check_database_connection
from app.api.v1 import api_v1_router
from app.api.v1.health import health_check, liveness_probe

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("connectx.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup and shutdown lifecycle manager."""
    logger.info(f"Starting {settings.PROJECT_NAME} in '{settings.ENVIRONMENT}' mode...")
    
    # Check DB connection & initialize schema
    try:
        from app.models import Base
        from app.core.database import engine, async_session_factory
        from app.core.seed import seed_demo_data
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema synchronized successfully.")

        async with async_session_factory() as session:
            await seed_demo_data(session)
    except Exception as exc:
        logger.warning(f"Database schema synchronization notice: {exc}")

    yield

    logger.info(f"Shutting down {settings.PROJECT_NAME}...")


def create_application() -> FastAPI:
    """Factory function to build and configure the FastAPI app."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="0.1.0",
        description="Next-generation universal social ecosystem, media, and file-sharing backend API.",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
        lifespan=lifespan,
    )

    # CORS Middleware configuration
    if settings.CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Mount API v1 router
    app.include_router(api_v1_router, prefix=settings.API_V1_STR)

    # Also mount direct root health check routes for easy container orchestration
    app.add_api_route("/health", health_check, methods=["GET"], tags=["Health & Status"], include_in_schema=False)
    app.add_api_route("/live", liveness_probe, methods=["GET"], tags=["Health & Status"], include_in_schema=False)

    return app


app = create_application()
