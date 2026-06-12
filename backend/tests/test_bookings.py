from datetime import date, timedelta

from tests.helpers import auth, create_booking, create_venue, future_date, provider_token, register_and_login


async def test_create_venue_booking_snapshots_price(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    booking = await create_booking(client, token, venue_id)
    assert booking["status"] == "pending"
    assert booking["total_price"] == "5000.00"


async def test_booking_past_date_rejected(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    payload = {"venue_id": venue_id, "event_date": (date.today() - timedelta(days=1)).isoformat()}
    response = await client.post("/api/bookings", json=payload, headers=auth(token))
    assert response.status_code == 422


async def test_booking_requires_single_target(client):
    token = await register_and_login(client, "client@test.com")
    response = await client.post(
        "/api/bookings", json={"venue_id": 1, "service_id": 1, "event_date": future_date()}, headers=auth(token)
    )
    assert response.status_code == 422
    response = await client.post("/api/bookings", json={"event_date": future_date()}, headers=auth(token))
    assert response.status_code == 422


async def test_double_booking_blocked_after_confirm(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    booking = await create_booking(client, token, venue_id)
    confirm = await client.post(f"/api/providers/me/bookings/{booking['id']}/confirm", headers=auth(prov))
    assert confirm.status_code == 200
    payload = {"venue_id": venue_id, "event_date": booking["event_date"]}
    response = await client.post("/api/bookings", json=payload, headers=auth(token))
    assert response.status_code == 409


async def test_list_only_own_bookings(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token_a = await register_and_login(client, "a@test.com")
    token_b = await register_and_login(client, "b@test.com")
    await create_booking(client, token_a, venue_id, days=10)
    response = await client.get("/api/bookings", headers=auth(token_b))
    assert response.status_code == 200
    assert response.json() == []


async def test_get_foreign_booking_forbidden(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token_a = await register_and_login(client, "a@test.com")
    token_b = await register_and_login(client, "b@test.com")
    booking = await create_booking(client, token_a, venue_id)
    response = await client.get(f"/api/bookings/{booking['id']}", headers=auth(token_b))
    assert response.status_code == 403


async def test_availability_lists_only_blocking_dates(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    pending = await create_booking(client, token, venue_id, days=10)
    confirmed = await create_booking(client, token, venue_id, days=20)
    await client.post(f"/api/providers/me/bookings/{confirmed['id']}/confirm", headers=auth(prov))
    response = await client.get(f"/api/venues/{venue_id}/availability")
    assert response.status_code == 200
    assert response.json()["booked_dates"] == [confirmed["event_date"]]


async def test_availability_unknown_venue(client):
    response = await client.get("/api/venues/9999/availability")
    assert response.status_code == 404


async def test_cancel_booking_and_not_twice(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    booking = await create_booking(client, token, venue_id)
    response = await client.post(f"/api/bookings/{booking['id']}/cancel", headers=auth(token))
    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"
    response = await client.post(f"/api/bookings/{booking['id']}/cancel", headers=auth(token))
    assert response.status_code == 409
