import os
from pathlib import Path
from urllib.parse import quote_plus

_pg_user = os.environ.get("PGUSER", "postgres")
_pg_password = quote_plus(os.environ.get("PGPASSWORD", ""))
_pg_host = os.environ.get("PGHOST", "127.0.0.1")
_pg_port = os.environ.get("PGPORT", "5432")
_test_db_name = os.environ.get("TEST_DB_NAME", "wedding_marketplace_test")
TEST_DATABASE_URL = f"postgresql+asyncpg://{_pg_user}:{_pg_password}@{_pg_host}:{_pg_port}/{_test_db_name}"

os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["JWT_SECRET"] = "test-secret-key-with-at-least-32-chars"
os.environ["MP_ACCESS_TOKEN"] = "test-mp-token"

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.session import get_db_session
from app.integrations.mercadopago_client import MercadoPagoClient
from app.main import create_app

MIGRATIONS_DIR = Path(__file__).parent.parent / "migrations"
MIGRATION_PATHS = sorted(MIGRATIONS_DIR.glob("*.sql"))
ALL_TABLES = "messages, notifications, favorites, reviews, payments, bookings, packages, services, venues, providers, users"


@pytest.fixture
async def engine():
    engine = create_async_engine(TEST_DATABASE_URL)
    async with engine.begin() as conn:
        for migration_path in MIGRATION_PATHS:
            for statement in migration_path.read_text().split(";"):
                if statement.strip():
                    await conn.exec_driver_sql(statement)
        await conn.exec_driver_sql(f"TRUNCATE {ALL_TABLES} RESTART IDENTITY CASCADE")
    yield engine
    await engine.dispose()


@pytest.fixture
async def session_factory(engine):
    return async_sessionmaker(engine, expire_on_commit=False)


@pytest.fixture
async def client(session_factory):
    app = create_app()

    async def override_session():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db_session] = override_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as http_client:
        yield http_client


@pytest.fixture
def mp_stub(monkeypatch):
    state = {"payments": {}, "preferences": []}

    async def create_preference(self, payload):
        state["preferences"].append(payload)
        return {"id": "pref-123", "init_point": "https://mp.test/init"}

    async def get_payment(self, payment_id):
        return state["payments"][payment_id]

    monkeypatch.setattr(MercadoPagoClient, "create_preference", create_preference)
    monkeypatch.setattr(MercadoPagoClient, "get_payment", get_payment)
    return state


@pytest.fixture
def mp_unconfigured(monkeypatch):
    monkeypatch.setattr(MercadoPagoClient, "is_configured", property(lambda self: False))
