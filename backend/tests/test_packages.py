from tests.helpers import SERVICE_PAYLOAD, auth, provider_token, register_and_login


async def create_service(client, token: str) -> int:
    response = await client.post("/api/services", json=SERVICE_PAYLOAD, headers=auth(token))
    assert response.status_code == 201, response.text
    return response.json()["id"]


async def test_create_and_get_package(client):
    prov = await provider_token(client)
    service_id = await create_service(client, prov)
    payload = {"name": "Combo Boda", "description": "Todo incluido", "price": "9000.00", "service_ids": [service_id]}
    created = await client.post("/api/packages", json=payload, headers=auth(prov))
    assert created.status_code == 201, created.text
    package_id = created.json()["id"]
    response = await client.get(f"/api/packages/{package_id}")
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Combo Boda"
    assert body["service_ids"] == [service_id]


async def test_package_rejects_foreign_service(client):
    owner = await provider_token(client, "owner@test.com")
    intruder = await provider_token(client, "intruder@test.com")
    foreign_service = await create_service(client, owner)
    payload = {"name": "Combo", "price": "1000.00", "service_ids": [foreign_service]}
    response = await client.post("/api/packages", json=payload, headers=auth(intruder))
    assert response.status_code == 400


async def test_list_my_packages(client):
    prov = await provider_token(client)
    service_id = await create_service(client, prov)
    await client.post(
        "/api/packages",
        json={"name": "Combo", "price": "1000.00", "service_ids": [service_id]},
        headers=auth(prov),
    )
    response = await client.get("/api/packages/mine", headers=auth(prov))
    assert response.status_code == 200
    assert response.json()["total"] == 1


async def test_update_and_delete_package(client):
    prov = await provider_token(client)
    service_id = await create_service(client, prov)
    created = await client.post(
        "/api/packages",
        json={"name": "Combo", "price": "1000.00", "service_ids": [service_id]},
        headers=auth(prov),
    )
    package_id = created.json()["id"]
    updated = await client.put(f"/api/packages/{package_id}", json={"name": "Combo Premium"}, headers=auth(prov))
    assert updated.status_code == 200
    assert updated.json()["name"] == "Combo Premium"
    deleted = await client.delete(f"/api/packages/{package_id}", headers=auth(prov))
    assert deleted.status_code == 204
    missing = await client.get(f"/api/packages/{package_id}")
    assert missing.status_code == 404


async def test_update_foreign_package_forbidden(client):
    owner = await provider_token(client, "owner@test.com")
    intruder = await provider_token(client, "intruder@test.com")
    service_id = await create_service(client, owner)
    created = await client.post(
        "/api/packages",
        json={"name": "Combo", "price": "1000.00", "service_ids": [service_id]},
        headers=auth(owner),
    )
    package_id = created.json()["id"]
    response = await client.put(f"/api/packages/{package_id}", json={"name": "Hacked"}, headers=auth(intruder))
    assert response.status_code == 403


async def test_create_package_requires_provider(client):
    token = await register_and_login(client, "client@test.com")
    response = await client.post(
        "/api/packages", json={"name": "Combo", "price": "1000.00", "service_ids": [1]}, headers=auth(token)
    )
    assert response.status_code == 403


async def test_public_profile_includes_packages(client):
    prov = await provider_token(client)
    service_id = await create_service(client, prov)
    me = await client.get("/api/providers/me", headers=auth(prov))
    provider_id = me.json()["id"]
    await client.post(
        "/api/packages",
        json={"name": "Combo", "price": "1000.00", "service_ids": [service_id]},
        headers=auth(prov),
    )
    response = await client.get(f"/api/providers/{provider_id}")
    assert response.status_code == 200
    assert [pkg["name"] for pkg in response.json()["packages"]] == ["Combo"]
