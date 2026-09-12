"""ConnectX API Version 1 Router Aggregation."""

from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.profiles import router as profiles_router
from app.api.v1.settings import router as settings_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router, prefix="/health", tags=["Health & Status"])
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication & Session"])
api_v1_router.include_router(profiles_router, prefix="/profiles", tags=["Profiles"])
api_v1_router.include_router(settings_router, prefix="/settings", tags=["User Settings"])
