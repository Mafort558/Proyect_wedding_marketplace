from tests.helpers import auth, create_venue, provider_token, register_and_login


async def test_toggle_and_list_favorite(client):
    provider = await provider_token(client, "fav-provider@test.com")
    venue_id = await create_venue(client, provider)
    token = await register_and_login(client, "fav-client@test.com")

    on = await client.post("/api/favorites/toggle", json={"venue_id": venue_id}, headers=auth(token))
    assert on.status_code == 200, on.text
    assert on.json()["favorited"] is True

    listing = await client.get("/api/favorites", headers=auth(token))
    assert listing.status_code == 200
    body = listing.json()
    assert len(body["venues"]) == 1
    assert body["venues"][0]["id"] == venue_id
    assert body["services"] == []

    ids = await client.get("/api/favorites/ids", headers=auth(token))
    assert ids.json()["venue_ids"] == [venue_id]

    off = await client.post("/api/favorites/toggle", json={"venue_id": venue_id}, headers=auth(token))
    assert off.json()["favorited"] is False

    empty = await client.get("/api/favorites", headers=auth(token))
    assert empty.json()["venues"] == []


async def test_favorites_require_auth(client):
    response = await client.get("/api/favorites")
    assert response.status_code == 401
