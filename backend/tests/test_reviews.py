from tests.helpers import (
    auth,
    create_booking,
    create_venue,
    provider_token,
    register_and_login,
)


async def _confirmed_booking(client):
    provider = await provider_token(client, "rev-provider@test.com")
    venue_id = await create_venue(client, provider)
    client_token = await register_and_login(client, "rev-client@test.com")
    booking = await create_booking(client, client_token, venue_id)
    confirm = await client.post(f"/api/providers/me/bookings/{booking['id']}/confirm", headers=auth(provider))
    assert confirm.status_code == 200, confirm.text
    return client_token, venue_id


async def test_create_and_list_review(client):
    client_token, venue_id = await _confirmed_booking(client)
    response = await client.post(
        "/api/reviews",
        json={"venue_id": venue_id, "rating": 5, "comment": "Excelente"},
        headers=auth(client_token),
    )
    assert response.status_code == 201, response.text
    assert response.json()["author_name"] == "Test User"

    listing = await client.get("/api/reviews", params={"venue_id": venue_id})
    assert listing.status_code == 200
    body = listing.json()
    assert body["total"] == 1
    assert body["average"] == 5.0


async def test_review_requires_booking(client):
    provider = await provider_token(client, "rev-provider2@test.com")
    venue_id = await create_venue(client, provider)
    outsider = await register_and_login(client, "outsider@test.com")
    response = await client.post(
        "/api/reviews",
        json={"venue_id": venue_id, "rating": 4},
        headers=auth(outsider),
    )
    assert response.status_code == 403, response.text


async def test_review_duplicate_rejected(client):
    client_token, venue_id = await _confirmed_booking(client)
    first = await client.post(
        "/api/reviews",
        json={"venue_id": venue_id, "rating": 5},
        headers=auth(client_token),
    )
    assert first.status_code == 201
    second = await client.post(
        "/api/reviews",
        json={"venue_id": venue_id, "rating": 3},
        headers=auth(client_token),
    )
    assert second.status_code == 409, second.text


async def test_list_reviews_requires_single_target(client):
    response = await client.get("/api/reviews")
    assert response.status_code == 400
