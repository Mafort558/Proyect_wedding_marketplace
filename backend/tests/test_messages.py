from tests.helpers import auth, login, register


async def test_send_and_read_thread(client):
    sender_body = await register(client, "sender@test.com")
    sender = await login(client, "sender@test.com")
    recipient_body = await register(client, "recipient@test.com")
    recipient = await login(client, "recipient@test.com")
    sent = await client.post(
        "/api/messages", json={"recipient_id": recipient_body["id"], "body": "Hola, consulta"}, headers=auth(sender)
    )
    assert sent.status_code == 201
    thread = await client.get(f"/api/messages/{sender_body['id']}", headers=auth(recipient))
    assert thread.status_code == 200
    body = thread.json()
    assert body["partner_id"] == sender_body["id"]
    assert body["messages"][0]["body"] == "Hola, consulta"


async def test_conversations_inbox_unread(client):
    await register(client, "sender@test.com")
    sender = await login(client, "sender@test.com")
    recipient_body = await register(client, "recipient@test.com")
    recipient = await login(client, "recipient@test.com")
    await client.post("/api/messages", json={"recipient_id": recipient_body["id"], "body": "Primero"}, headers=auth(sender))
    await client.post("/api/messages", json={"recipient_id": recipient_body["id"], "body": "Segundo"}, headers=auth(sender))
    inbox = await client.get("/api/messages", headers=auth(recipient))
    assert inbox.status_code == 200
    items = inbox.json()["items"]
    assert len(items) == 1
    assert items[0]["unread_count"] == 2
    assert items[0]["last_body"] == "Segundo"


async def test_thread_marks_read(client):
    sender_body = await register(client, "sender@test.com")
    sender = await login(client, "sender@test.com")
    recipient_body = await register(client, "recipient@test.com")
    recipient = await login(client, "recipient@test.com")
    await client.post("/api/messages", json={"recipient_id": recipient_body["id"], "body": "Hola"}, headers=auth(sender))
    await client.get(f"/api/messages/{sender_body['id']}", headers=auth(recipient))
    inbox = await client.get("/api/messages", headers=auth(recipient))
    assert inbox.json()["items"][0]["unread_count"] == 0


async def test_cannot_message_self(client):
    user_body = await register(client, "self@test.com")
    token = await login(client, "self@test.com")
    response = await client.post(
        "/api/messages", json={"recipient_id": user_body["id"], "body": "yo"}, headers=auth(token)
    )
    assert response.status_code == 422


async def test_messages_require_auth(client):
    response = await client.get("/api/messages")
    assert response.status_code == 401
