"""ConnectX Core Application Settings & Configuration.

Loads environment variables using Pydantic Settings V2.
"""

from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # General Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PROJECT_NAME: str = "ConnectX Universal Social Ecosystem"
    API_V1_STR: str = "/api/v1"

    # Server Bindings
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security & Tokens
    SECRET_KEY: str = "dev-secret-key-change-in-production-connectx-backend-2026"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database Configuration
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "connectx"
    POSTGRES_PASSWORD: str = "connectx_secure_pass"
    POSTGRES_DB: str = "connectx"
    DATABASE_URL: str = (
        "postgresql+asyncpg://connectx:connectx_secure_pass@localhost:5432/connectx"
    )
    SYNC_DATABASE_URL: str = (
        "postgresql+psycopg2://connectx:connectx_secure_pass@localhost:5432/connectx"
    )

    # Database Connection Pool Settings
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800
    DB_ECHO: bool = False

    # Redis Settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0
    REDIS_URL: str = "redis://localhost:6379/0"

    # S3 Object Storage Settings
    S3_ENDPOINT_URL: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET_MEDIA: str = "connectx-media"
    S3_BUCKET_FILES: str = "connectx-files"
    S3_REGION: str = "us-east-1"

    # CORS Origins
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Union[str, List[str]]) -> List[str]:
        if isinstance(value, str):
            import json
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [str(origin).rstrip("/") for origin in parsed]
            except Exception:
                return [origin.strip().rstrip("/") for origin in value.split(",") if origin.strip()]
        elif isinstance(value, list):
            return [str(origin).rstrip("/") for origin in value]
        return ["*"]

    @property
    def is_sqlite(self) -> bool:
        return "sqlite" in self.DATABASE_URL.lower()


settings = Settings()
