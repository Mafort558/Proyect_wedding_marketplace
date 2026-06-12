from decimal import Decimal

from sqlalchemy import text

from tests.helpers import auth, create_booking, create_venue, provider_token, register_and_login


async def checkout(client, token, booking_id):
    return await client.post("/api/payments/checkout", json={"booking_id": booking_id}, headers=auth(token))


async def setup_pending_booking(client):
    prov = await provider_token(client)
    venue_id = await create_venue(client, prov)
    token = await register_and_login(client, "client@test.com")
    booking = await create_booking(client, token, venue_id)
    return token, booking


async def fetch_payment(session_factory, payment_id):
    async with session_factory() as session:
        result = await session.execute(
            text("SELECT amount, platform_fee, status, external_id FROM payments WHERE id = :id"),
            {"id": payment_id},
        )
        return result.one()


async def test_checkout_unconfigured_returns_503(client, mp_unconfigured):
    token, booking = await setup_pending_booking(client)
    response = await checkout(client, token, booking["id"])
    assert response.status_code == 503


async def test_checkout_creates_payment_with_fee(client, mp_stub, session_factory):
    token, booking = await setup_pending_booking(client)
    response = await checkout(client, token, booking["id"])
    assert response.status_code == 201
    body = response.json()
    assert body["init_point"] == "https://mp.test/init"
    payment = await fetch_payment(session_factory, body["payment_id"])
    assert payment.amount == Decimal("1000.00")
    assert payment.platform_fee == Decimal("100.00")
    assert mp_stub["preferences"][0]["external_reference"] == str(body["payment_id"])


async def test_checkout_foreign_booking_forbidden(client, mp_stub):
    token, booking = await setup_pending_booking(client)
    other = await register_and_login(client, "other@test.com")
    response = await checkout(client, other, booking["id"])
    assert response.status_code == 403


async def test_checkout_non_pending_booking_conflict(client, mp_stub):
    token, booking = await setup_pending_booking(client)
    await client.post(f"/api/bookings/{booking['id']}/cancel", headers=auth(token))
    response = await checkout(client, token, booking["id"])
    assert response.status_code == 409


async def test_webhook_approved_marks_deposit_paid(client, mp_stub, session_factory):
    token, booking = await setup_pending_booking(client)
    body = (await checkout(client, token, booking["id"])).json()
    mp_stub["payments"]["mp-1"] = {"status": "approved", "external_reference": str(body["payment_id"])}
    response = await client.post("/api/payments/webhook?type=payment&data.id=mp-1")
    assert response.status_code == 200
    detail = await client.get(f"/api/bookings/{booking['id']}", headers=auth(token))
    assert detail.json()["status"] == "deposit_paid"
    payment = await fetch_payment(session_factory, body["payment_id"])
    assert payment.status == "approved"
    assert payment.external_id == "mp-1"


async def test_webhook_idempotent_after_approved(client, mp_stub, session_factory):
    token, booking = await setup_pending_booking(client)
    body = (await checkout(client, token, booking["id"])).json()
    mp_stub["payments"]["mp-1"] = {"status": "approved", "external_reference": str(body["payment_id"])}
    await client.post("/api/payments/webhook?type=payment&data.id=mp-1")
    mp_stub["payments"]["mp-2"] = {"status": "rejected", "external_reference": str(body["payment_id"])}
    response = await client.post("/api/payments/webhook?type=payment&data.id=mp-2")
    assert response.status_code == 200
    payment = await fetch_payment(session_factory, body["payment_id"])
    assert payment.status == "approved"
    assert payment.external_id == "mp-1"
    detail = await client.get(f"/api/bookings/{booking['id']}", headers=auth(token))
    assert detail.json()["status"] == "deposit_paid"


async def test_webhook_rejected_keeps_booking_pending(client, mp_stub, session_factory):
    token, booking = await setup_pending_booking(client)
    body = (await checkout(client, token, booking["id"])).json()
    mp_stub["payments"]["mp-9"] = {"status": "rejected", "external_reference": str(body["payment_id"])}
    await client.post("/api/payments/webhook?type=payment&data.id=mp-9")
    payment = await fetch_payment(session_factory, body["payment_id"])
    assert payment.status == "rejected"
    detail = await client.get(f"/api/bookings/{booking['id']}", headers=auth(token))
    assert detail.json()["status"] == "pending"


async def test_webhook_ignores_unknown_type(client, mp_stub):
    response = await client.post("/api/payments/webhook?type=merchant_order&id=123")
    assert response.status_code == 200
