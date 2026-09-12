"""Tests for Health & Status Endpoints."""

# pyrefly: ignore [missing-import]
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_liveness_probe(async_client: AsyncClient):
    """Test the /live endpoint returns alive status."""
    response = await async_client.get("/live")
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "alive"}


@pytest.mark.asyncio
async def test_health_check_endpoint(async_client: AsyncClient):
    """Test the /api/v1/health endpoint returns health payload and DB status."""
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "environment" in data
    assert "database" in data
    assert data["project"] == "ConnectX Universal Social Ecosystem"


@pytest.mark.asyncio
async def test_root_health_route(async_client: AsyncClient):
    """Test that root /health route works identically."""
    response = await async_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data
