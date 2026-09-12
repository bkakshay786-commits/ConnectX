"""Integration tests for Profiles and UserSettings API routes."""

import pytest
import pytest_asyncio
from httpx import AsyncClient


@pytest_asyncio.fixture
async def auth_headers(async_client: AsyncClient):
    """Fixture to register and authenticate a test user, returning auth headers."""
    reg_payload = {
        "email": "emily@connectx.social",
        "username": "emily_designs",
        "password": "Password123!",
        "full_name": "Emily Chen",
        "bio": "Designing spatial interfaces & sharing creative process ✨",
    }
    response = await async_client.post("/api/v1/auth/register", json=reg_payload)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_get_and_update_my_profile(async_client: AsyncClient, auth_headers: dict):
    """Test retrieving and updating the authenticated user's own profile."""
    # 1. Get my profile
    res_get = await async_client.get("/api/v1/profiles/me", headers=auth_headers)
    assert res_get.status_code == 200
    data = res_get.json()
    assert data["display_name"] == "Emily Chen"
    assert data["username"] == "emily_designs"

    # 2. Update profile
    updates = {
        "display_name": "Emily Chen (Spatial Lead)",
        "bio": "Updated bio with Web3 & 3D Shaders",
        "website": "https://emilychen.design",
        "location": "San Francisco, CA",
        "pronouns": "she/her",
        "account_visibility": "private",
    }
    res_patch = await async_client.patch(
        "/api/v1/profiles/me",
        headers=auth_headers,
        json=updates,
    )
    assert res_patch.status_code == 200
    updated = res_patch.json()
    assert updated["display_name"] == "Emily Chen (Spatial Lead)"
    assert updated["bio"] == "Updated bio with Web3 & 3D Shaders"
    assert updated["location"] == "San Francisco, CA"
    assert updated["account_visibility"] == "private"


@pytest.mark.asyncio
async def test_get_public_profile_by_username(async_client: AsyncClient, auth_headers: dict):
    """Test fetching public profile by username."""
    res = await async_client.get("/api/v1/profiles/emily_designs")
    assert res.status_code == 200
    data = res.json()
    assert data["display_name"] == "Emily Chen"

    # Non-existent user returns 404
    res_404 = await async_client.get("/api/v1/profiles/non_existent_ghost_user")
    assert res_404.status_code == 404


@pytest.mark.asyncio
async def test_get_and_update_settings(async_client: AsyncClient, auth_headers: dict):
    """Test fetching and updating notification and privacy settings."""
    # 1. Get default settings
    res_get = await async_client.get("/api/v1/settings/me", headers=auth_headers)
    assert res_get.status_code == 200
    settings_data = res_get.json()
    assert settings_data["theme_mode"] == "obsidian"
    assert settings_data["pause_all_notifications"] is False

    # 2. Update settings toggles
    patch_payload = {
        "pause_all_notifications": True,
        "theme_mode": "midnight",
        "accent_color": "emerald",
        "glow_effects": False,
        "message_requests": "everyone",
        "hide_offensive_words": False,
    }
    res_patch = await async_client.patch(
        "/api/v1/settings/me",
        headers=auth_headers,
        json=patch_payload,
    )
    assert res_patch.status_code == 200
    patched = res_patch.json()
    assert patched["pause_all_notifications"] is True
    assert patched["theme_mode"] == "midnight"
    assert patched["accent_color"] == "emerald"
    assert patched["glow_effects"] is False
    assert patched["message_requests"] == "everyone"
    assert patched["hide_offensive_words"] is False

    # 3. Retrieve settings again to ensure persistence
    res_verify = await async_client.get("/api/v1/settings/me", headers=auth_headers)
    assert res_verify.status_code == 200
    assert res_verify.json()["theme_mode"] == "midnight"
    assert res_verify.json()["pause_all_notifications"] is True
