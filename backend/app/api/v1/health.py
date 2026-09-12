"""Health Check Endpoints.

Provides system readiness and liveness checks including PostgreSQL connectivity.
"""

from fastapi import APIRouter, status
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.core.config import settings
from app.core.database import check_database_connection

router = APIRouter()


class DatabaseHealthResponse(BaseModel):
    status: str
    connected: bool
    database: Optional[str] = None
    dialect: Optional[str] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    environment: str
    version: str
    project: str
    database: DatabaseHealthResponse


@router.get(
    "",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="System and Database Health Check",
    description="Returns API status, active environment, and live PostgreSQL connection verification.",
)
async def health_check() -> HealthResponse:
    db_status = await check_database_connection()
    overall_status = "ok" if db_status.get("connected") else "degraded"

    return HealthResponse(
        status=overall_status,
        environment=settings.ENVIRONMENT,
        version="0.1.0",
        project=settings.PROJECT_NAME,
        database=DatabaseHealthResponse(**db_status),
    )


@router.get(
    "/live",
    status_code=status.HTTP_200_OK,
    summary="Liveness Probe",
    description="Lightweight liveness probe for orchestrators/monitoring.",
)
async def liveness_probe() -> Dict[str, str]:
    return {"status": "alive"}
