import asyncio
import os
from decimal import Decimal

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import get_session_factory
from app.models.entities import Provider, Service, User, Venue
from app.models.enums import ProviderCategory, UserRole


def build_users(password_hash: str) -> list[User]:
    return [
        User(email="cliente@example.com", password_hash=password_hash, full_name="Carla Cliente", role=UserRole.CLIENT),
        User(email="salones@example.com", password_hash=password_hash, full_name="Sofia Salones", role=UserRole.PROVIDER),
        User(email="catering@example.com", password_hash=password_hash, full_name="Camilo Catering", role=UserRole.PROVIDER),
        User(email="musica@example.com", password_hash=password_hash, full_name="Marcos Musica", role=UserRole.PROVIDER),
    ]


def build_providers(users_by_email: dict[str, User]) -> list[Provider]:
    return [
        Provider(user_id=users_by_email["salones@example.com"].id, business_name="Salones del Litoral", category=ProviderCategory.VENUE, description="Salones de eventos en Rosario y alrededores", phone="+54 341 555-0101"),
        Provider(user_id=users_by_email["catering@example.com"].id, business_name="Sabores Catering", category=ProviderCategory.CATERING, description="Catering completo para bodas", phone="+54 341 555-0202"),
        Provider(user_id=users_by_email["musica@example.com"].id, business_name="DJ Eventos MM", category=ProviderCategory.MUSIC, description="DJ y sonido profesional", phone="+54 341 555-0303"),
    ]


def build_venues(provider: Provider) -> list[Venue]:
    return [
        Venue(provider_id=provider.id, name="Estancia La Arboleda", description="Salon campestre con parque de 2 hectareas, capacidad para grandes eventos", capacity=300, city="Rosario", address="Ruta 9 km 12", price=Decimal("2500000"), deposit_amount=Decimal("500000"), photos=[]),
        Venue(provider_id=provider.id, name="Salon Centenario", description="Salon clasico en pleno centro, ideal para bodas elegantes", capacity=150, city="Rosario", address="Cordoba 1234", price=Decimal("1200000"), deposit_amount=Decimal("240000"), photos=[]),
        Venue(provider_id=provider.id, name="Quinta Los Alamos", description="Quinta con pileta y quincho, ambiente relajado", capacity=100, city="Funes", address="Los Alamos 567", price=Decimal("900000"), deposit_amount=Decimal("180000"), photos=[]),
    ]


def build_services(providers_by_name: dict[str, Provider]) -> list[Service]:
    return [
        Service(provider_id=providers_by_name["Sabores Catering"].id, name="Menu clasico (por persona)", category=ProviderCategory.CATERING, description="Entrada, plato principal, postre y mesa dulce", price=Decimal("35000"), photos=[]),
        Service(provider_id=providers_by_name["Sabores Catering"].id, name="Menu premium (por persona)", category=ProviderCategory.CATERING, description="Recepcion, dos pasos, postre, mesa dulce y barra de tragos", price=Decimal("55000"), photos=[]),
        Service(provider_id=providers_by_name["DJ Eventos MM"].id, name="DJ + sonido e iluminacion", category=ProviderCategory.MUSIC, description="Cobertura completa de la fiesta, cabina, luces y sonido", price=Decimal("450000"), photos=[]),
    ]


async def seed() -> None:
    password_hash = hash_password(os.environ.get("SEED_PASSWORD", "Password123!"))
    async with get_session_factory()() as session:
        existing = await session.scalar(select(User.id).limit(1))
        if existing is not None:
            print("Database already has users, skipping seed")
            return

        users = build_users(password_hash)
        session.add_all(users)
        await session.flush()

        users_by_email = {user.email: user for user in users}
        providers = build_providers(users_by_email)
        session.add_all(providers)
        await session.flush()

        providers_by_name = {provider.business_name: provider for provider in providers}
        venues = build_venues(providers_by_name["Salones del Litoral"])
        services = build_services(providers_by_name)
        session.add_all(venues)
        session.add_all(services)
        await session.commit()
        print(f"Seeded {len(users)} users, {len(providers)} providers, {len(venues)} venues, {len(services)} services")


if __name__ == "__main__":
    asyncio.run(seed())
