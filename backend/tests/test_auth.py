import os
from datetime import datetime, timedelta, timezone

import jwt

from tests.helpers import auth, login, register, register_and_login


async def test_register_ok(client):
    user = await register(client, "new@test.com")
    assert user["email"] == "new@test.com"
    assert user["role"] == "client"
    assert "password" not in user


async def test_register_duplicate_email(client):
    await register(client, "dup@test.com")
    response = await client.post(
        "/api/auth/register",
        json={"email": "dup@test.com", "password": "password123", "full_name": "Other", "role": "client"},
    )
    assert response.status_code == 409


async def test_register_provider_requires_business_fields(client):
    response = await client.post(
        "/api/auth/register",
        json={"email": "prov@test.com", "password": "password123", "full_name": "P", "role": "provider"},
    )
    assert response.status_code == 422


async def test_register_provider_creates_profile(client):
    token = await register_and_login(client, "prov@test.com", role="provider", business_name="Biz", category="venue")
    response = await client.get("/api/providers/me", headers=auth(token))
    assert response.status_code == 200
    assert response.json()["business_name"] == "Biz"


async def test_login_invalid_credentials(client):
    await register(client, "user@test.com")
    response = await client.post("/api/auth/login", json={"email": "user@test.com", "password": "wrong-password"})
    assert response.status_code == 401


async def test_me_with_valid_token(client):
    token = await register_and_login(client, "me@test.com")
    response = await client.get("/api/auth/me", headers=auth(token))
    assert response.status_code == 200
    assert response.json()["email"] == "me@test.com"


async def test_me_with_expired_token(client):
    await register(client, "expired@test.com")
    expired = jwt.encode(
        {"sub": "1", "role": "client", "exp": datetime.now(timezone.utc) - timedelta(hours=1)},
        os.environ["JWT_SECRET"],
        algorithm="HS256",
    )
    response = await client.get("/api/auth/me", headers=auth(expired))
    assert response.status_code == 401


async def test_me_without_token(client):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401
