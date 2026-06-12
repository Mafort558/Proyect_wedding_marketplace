from datetime import date, timedelta

from httpx import AsyncClient

DEFAULT_PASSWORD = "password123"
VENUE_PAYLOAD = {
    "name": "Salon Test",
    "capacity": 100,
    "city": "Rosario",
    "address": "Calle Falsa 123",
    "price": "5000.00",
    "deposit_amount": "1000.00",
}
SERVICE_PAYLOAD = {
    "name": "Catering Test",
    "category": "catering",
    "price": "2500.00",
}


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def future_date(days: int = 30) -> str:
    return (date.today() + timedelta(days=days)).isoformat()


async def register(client: AsyncClient, email: str, role: str = "client", **extra) -> dict:
    payload = {
        "email": email,
        "password": DEFAULT_PASSWORD,
        "full_name": "Test User",
        "role": role,
        **extra,
    }
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


async def login(client: AsyncClient, email: str) -> str:
    response = await client.post("/api/auth/login", json={"email": email, "password": DEFAULT_PASSWORD})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


async def register_and_login(client: AsyncClient, email: str, role: str = "client", **extra) -> str:
    await register(client, email, role, **extra)
    return await login(client, email)


async def provider_token(client: AsyncClient, email: str = "provider@test.com") -> str:
    return await register_and_login(client, email, role="provider", business_name="Biz", category="venue")


async def create_venue(client: AsyncClient, token: str) -> int:
    response = await client.post("/api/venues", json=VENUE_PAYLOAD, headers=auth(token))
    assert response.status_code == 201, response.text
    return response.json()["id"]


async def create_booking(client: AsyncClient, token: str, venue_id: int, days: int = 30) -> dict:
    payload = {"venue_id": venue_id, "event_date": future_date(days)}
    response = await client.post("/api/bookings", json=payload, headers=auth(token))
    assert response.status_code == 201, response.text
    return response.json()
