from tests.helpers import auth, create_booking, create_venue, provider_token, register_and_login


async def test_provider_notified_on_booking(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    await create_booking(client, token, venue_id)
    response = await client.get("/api/notifications", headers=auth(prov))
    assert response.status_code == 200
    body = response.json()
    assert body["unread_count"] == 1
    assert body["items"][0]["type"] == "booking_received"


async def test_client_notified_on_confirm_and_mark_read(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    booking = await create_booking(client, token, venue_id)
    await client.post(f"/api/providers/me/bookings/{booking['id']}/confirm", headers=auth(prov))
    listing = await client.get("/api/notifications", headers=auth(token))
    assert listing.json()["unread_count"] == 1
    notification_id = listing.json()["items"][0]["id"]
    read = await client.post(f"/api/notifications/{notification_id}/read", headers=auth(token))
    assert read.status_code == 200
    assert read.json()["read"] is True
    after = await client.get("/api/notifications", headers=auth(token))
    assert after.json()["unread_count"] == 0


async def test_mark_all_read(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    await create_booking(client, token, venue_id)
    await create_booking(client, token, venue_id, days=60)
    response = await client.post("/api/notifications/read-all", headers=auth(prov))
    assert response.status_code == 204
    after = await client.get("/api/notifications", headers=auth(prov))
    assert after.json()["unread_count"] == 0


async def test_notifications_require_auth(client):
    response = await client.get("/api/notifications")
    assert response.status_code == 401
