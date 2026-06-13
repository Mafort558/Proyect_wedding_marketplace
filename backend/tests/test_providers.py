from tests.helpers import (
    SERVICE_PAYLOAD,
    VENUE_PAYLOAD,
    auth,
    create_booking,
    create_venue,
    provider_token,
    register_and_login,
)


async def test_providers_me_requires_provider_role(client):
    token = await register_and_login(client, "client@test.com")
    response = await client.get("/api/providers/me", headers=auth(token))
    assert response.status_code == 403


async def test_update_foreign_venue_forbidden(client):
    owner = await provider_token(client, "owner@test.com")
    intruder = await provider_token(client, "intruder@test.com")
    venue_id = await create_venue(client, owner)
    response = await client.put(f"/api/venues/{venue_id}", json={"name": "Hacked"}, headers=auth(intruder))
    assert response.status_code == 403


async def test_delete_foreign_venue_forbidden(client):
    owner = await provider_token(client, "owner@test.com")
    intruder = await provider_token(client, "intruder@test.com")
    venue_id = await create_venue(client, owner)
    response = await client.delete(f"/api/venues/{venue_id}", headers=auth(intruder))
    assert response.status_code == 403


async def test_delete_venue_with_bookings_conflict(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    await create_booking(client, token, venue_id)
    response = await client.delete(f"/api/venues/{venue_id}", headers=auth(prov))
    assert response.status_code == 409


async def test_delete_venue_without_bookings(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    response = await client.delete(f"/api/venues/{venue_id}", headers=auth(prov))
    assert response.status_code == 204


async def test_list_my_venues_only_own(client):
    owner = await provider_token(client, "owner@test.com")
    other = await provider_token(client, "other@test.com")
    own_venue_id = await create_venue(client, owner)
    await create_venue(client, other)
    response = await client.get("/api/providers/me/venues", headers=auth(owner))
    assert response.status_code == 200
    assert [venue["id"] for venue in response.json()] == [own_venue_id]


async def test_list_my_services_only_own(client):
    owner = await provider_token(client, "owner@test.com")
    other = await provider_token(client, "other@test.com")
    created = await client.post("/api/services", json=SERVICE_PAYLOAD, headers=auth(owner))
    assert created.status_code == 201
    await client.post("/api/services", json=SERVICE_PAYLOAD, headers=auth(other))
    response = await client.get("/api/providers/me/services", headers=auth(owner))
    assert response.status_code == 200
    assert [service["id"] for service in response.json()] == [created.json()["id"]]


async def test_service_crud_with_ownership(client):
    owner = await provider_token(client, "owner@test.com")
    intruder = await provider_token(client, "intruder@test.com")
    created = await client.post("/api/services", json=SERVICE_PAYLOAD, headers=auth(owner))
    assert created.status_code == 201
    service_id = created.json()["id"]
    response = await client.put(f"/api/services/{service_id}", json={"name": "Hacked"}, headers=auth(intruder))
    assert response.status_code == 403
    response = await client.put(f"/api/services/{service_id}", json={"name": "Updated"}, headers=auth(owner))
    assert response.status_code == 200
    assert response.json()["name"] == "Updated"
    response = await client.delete(f"/api/services/{service_id}", headers=auth(owner))
    assert response.status_code == 204


async def test_create_venue_requires_provider(client):
    token = await register_and_login(client, "client@test.com")
    response = await client.post("/api/venues", json=VENUE_PAYLOAD, headers=auth(token))
    assert response.status_code == 403


async def test_provider_sees_received_bookings(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    booking = await create_booking(client, token, venue_id)
    response = await client.get("/api/providers/me/bookings", headers=auth(prov))
    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [booking["id"]]


async def test_confirm_booking(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    booking = await create_booking(client, token, venue_id)
    response = await client.post(f"/api/providers/me/bookings/{booking['id']}/confirm", headers=auth(prov))
    assert response.status_code == 200
    assert response.json()["status"] == "confirmed"


async def test_reject_booking(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    booking = await create_booking(client, token, venue_id)
    response = await client.post(f"/api/providers/me/bookings/{booking['id']}/reject", headers=auth(prov))
    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"


async def test_confirm_foreign_booking_forbidden(client):
    owner = await provider_token(client, "owner@test.com")
    intruder = await provider_token(client, "intruder@test.com")
    venue_id = await create_venue(client, owner)
    token = await register_and_login(client, "client@test.com")
    booking = await create_booking(client, token, venue_id)
    response = await client.post(f"/api/providers/me/bookings/{booking['id']}/confirm", headers=auth(intruder))
    assert response.status_code == 403


async def test_confirm_cancelled_booking_conflict(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    booking = await create_booking(client, token, venue_id)
    await client.post(f"/api/bookings/{booking['id']}/cancel", headers=auth(token))
    response = await client.post(f"/api/providers/me/bookings/{booking['id']}/confirm", headers=auth(prov))
    assert response.status_code == 409


async def test_public_profile_lists_offerings(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    venue = await client.get(f"/api/venues/{venue_id}")
    provider_id = venue.json()["provider_id"]
    response = await client.get(f"/api/providers/{provider_id}")
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == provider_id
    assert body["business_name"] == "Biz"
    assert [item["id"] for item in body["venues"]] == [venue_id]
    assert body["rating"] is None
    assert body["review_count"] == 0


async def test_public_profile_not_found(client):
    response = await client.get("/api/providers/9999")
    assert response.status_code == 404


async def test_update_profile(client):
    prov = await provider_token(client)
    payload = {"business_name": "Nuevo Nombre", "description": "Mejor descripción", "phone": "+54 9 341 5550000"}
    response = await client.patch("/api/providers/me", json=payload, headers=auth(prov))
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["business_name"] == "Nuevo Nombre"
    assert body["description"] == "Mejor descripción"
    assert body["phone"] == "+54 9 341 5550000"


async def test_dashboard_metrics(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    booking = await create_booking(client, token, venue_id)
    await client.post(f"/api/providers/me/bookings/{booking['id']}/confirm", headers=auth(prov))
    response = await client.get("/api/providers/me/dashboard", headers=auth(prov))
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["total_venues"] == 1
    assert body["total_bookings"] == 1
    assert body["bookings_by_status"]["confirmed"] == 1
    assert body["upcoming_events"] == 1
    assert body["confirmed_revenue"] == "5000.00"


async def test_dashboard_requires_provider(client):
    token = await register_and_login(client, "client@test.com")
    response = await client.get("/api/providers/me/dashboard", headers=auth(token))
    assert response.status_code == 403
