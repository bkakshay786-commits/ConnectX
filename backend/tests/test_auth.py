"""Integration tests for ConnectX Authentication API routes."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(async_client: AsyncClient):
    """Test user registration provisions user, profile, and initial tokens."""
    payload = {
        "email": "alex@connectx.social",
        "username": "alex_creator",
        "password": "SecurePassword123!",
        "full_name": "Alex Rivera",
        "bio": "3D spatial designer and developer",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "alex@connectx.social"
    assert data["user"]["username"] == "alex_creator"
    assert data["user"]["profile"]["display_name"] == "Alex Rivera"
    assert data["user"]["settings"]["theme_mode"] == "obsidian"


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient):
    """Test registering with an existing email returns 409 Conflict."""
    payload = {
        "email": "dup@connectx.social",
        "username": "user_one",
        "password": "Password123!",
        "full_name": "User One",
    }
    res1 = await async_client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    payload2 = {
        "email": "dup@connectx.social",
        "username": "user_two",
        "password": "Password123!",
        "full_name": "User Two",
    }
    res2 = await async_client.post("/api/v1/auth/register", json=payload2)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


@pytest.mark.asyncio
async def test_register_duplicate_username(async_client: AsyncClient):
    """Test registering with an existing username returns 409 Conflict."""
    payload = {
        "email": "userA@connectx.social",
        "username": "unique_handle",
        "password": "Password123!",
        "full_name": "User A",
    }
    res1 = await async_client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    payload2 = {
        "email": "userB@connectx.social",
        "username": "UNIQUE_HANDLE",  # Case insensitive normalized collision
        "password": "Password123!",
        "full_name": "User B",
    }
    res2 = await async_client.post("/api/v1/auth/register", json=payload2)
    assert res2.status_code == 409
    assert "already taken" in res2.json()["detail"]


@pytest.mark.asyncio
async def test_login_with_email_and_username(async_client: AsyncClient):
    """Test login works using either email or username."""
    # Register user
    reg_payload = {
        "email": "sarah@connectx.social",
        "username": "sarah_ai",
        "password": "ValidPassword99!",
        "full_name": "Sarah Connor",
    }
    await async_client.post("/api/v1/auth/register", json=reg_payload)

    # 1. Login with email
    login_email = {
        "identifier": "sarah@connectx.social",
        "password": "ValidPassword99!",
    }
    res_email = await async_client.post("/api/v1/auth/login", json=login_email)
    assert res_email.status_code == 200
    assert "access_token" in res_email.json()

    # 2. Login with username
    login_user = {
        "identifier": "sarah_ai",
        "password": "ValidPassword99!",
    }
    res_user = await async_client.post("/api/v1/auth/login", json=login_user)
    assert res_user.status_code == 200
    assert "access_token" in res_user.json()

    # 3. Wrong password returns 401
    bad_login = {
        "identifier": "sarah_ai",
        "password": "WrongPassword!",
    }
    res_bad = await async_client.post("/api/v1/auth/login", json=bad_login)
    assert res_bad.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_protected_endpoint(async_client: AsyncClient):
    """Test /auth/me requires valid bearer token."""
    # Unauthenticated returns 401
    res_unauth = await async_client.get("/api/v1/auth/me")
    assert res_unauth.status_code == 401

    # Authenticated returns user details
    reg_payload = {
        "email": "me_test@connectx.social",
        "username": "me_tester",
        "password": "Password123!",
        "full_name": "Me Tester",
    }
    reg_res = await async_client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    res_auth = await async_client.get("/api/v1/auth/me", headers=headers)
    assert res_auth.status_code == 200
    data = res_auth.json()
    assert data["username"] == "me_tester"
    assert data["profile"]["display_name"] == "Me Tester"


@pytest.mark.asyncio
async def test_refresh_token_rotation_and_revocation(async_client: AsyncClient):
    """Test token rotation invalidates previous refresh token."""
    reg_payload = {
        "email": "refresh_test@connectx.social",
        "username": "refresh_user",
        "password": "Password123!",
        "full_name": "Refresh User",
    }
    reg_res = await async_client.post("/api/v1/auth/register", json=reg_payload)
    old_refresh = reg_res.json()["refresh_token"]

    # Refresh token rotation
    ref_res = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh},
    )
    assert ref_res.status_code == 200
    new_refresh = ref_res.json()["refresh_token"]
    assert new_refresh != old_refresh

    # Attempting to reuse old refresh token must be rejected
    reuse_res = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh},
    )
    assert reuse_res.status_code == 401


@pytest.mark.asyncio
async def test_otp_flow_and_password_reset(async_client: AsyncClient):
    """Test OTP code generation and password reset."""
    reg_payload = {
        "email": "reset_test@connectx.social",
        "username": "reset_user",
        "password": "OldPassword123!",
        "full_name": "Reset User",
    }
    await async_client.post("/api/v1/auth/register", json=reg_payload)

    # 1. Send OTP for reset
    otp_req = {"contact": "reset_test@connectx.social", "purpose": "reset_password"}
    otp_res = await async_client.post("/api/v1/auth/otp/send", json=otp_req)
    assert otp_res.status_code == 200
    # Extract dev code from message
    msg = otp_res.json()["message"]
    code = msg.split("Dev: ")[1].rstrip(")")

    # 2. Reset password
    reset_payload = {
        "identifier": "reset_test@connectx.social",
        "code": code,
        "new_password": "NewSecurePassword456!",
    }
    reset_res = await async_client.post("/api/v1/auth/reset-password", json=reset_payload)
    assert reset_res.status_code == 200

    # 3. Old password fails
    old_login = {
        "identifier": "reset_test@connectx.social",
        "password": "OldPassword123!",
    }
    assert (await async_client.post("/api/v1/auth/login", json=old_login)).status_code == 401

    # 4. New password succeeds
    new_login = {
        "identifier": "reset_test@connectx.social",
        "password": "NewSecurePassword456!",
    }
    assert (await async_client.post("/api/v1/auth/login", json=new_login)).status_code == 200
