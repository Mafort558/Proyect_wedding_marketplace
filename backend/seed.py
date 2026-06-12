import asyncio
import os
from decimal import Decimal

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import get_session_factory
from app.models.entities import Provider, Service, User, Venue
from app.models.enums import ProviderCategory, UserRole

PHOTO_BASE_URL = "https://picsum.photos/seed"


def photo_urls(slug: str, count: int) -> list[str]:
    return [f"{PHOTO_BASE_URL}/{slug}-{index}/800/600" for index in range(1, count + 1)]


def build_users(password_hash: str) -> list[User]:
    provider_names = [
        ("salones@example.com", "Sofia Salones"),
        ("estancias@example.com", "Esteban Estancias"),
        ("catering@example.com", "Camilo Catering"),
        ("musica@example.com", "Marcos Musica"),
        ("fotografia@example.com", "Fernanda Fotografia"),
        ("decoracion@example.com", "Diana Decoracion"),
    ]
    users = [
        User(email="cliente@example.com", password_hash=password_hash, full_name="Carla Cliente", role=UserRole.CLIENT),
    ]
    users.extend(
        User(email=email, password_hash=password_hash, full_name=full_name, role=UserRole.PROVIDER)
        for email, full_name in provider_names
    )
    return users


def build_providers(users_by_email: dict[str, User]) -> list[Provider]:
    return [
        Provider(user_id=users_by_email["salones@example.com"].id, business_name="Salones del Litoral", category=ProviderCategory.VENUE, description="Salones urbanos para bodas, cumpleanos y eventos corporativos en Rosario", phone="+54 341 555-0101"),
        Provider(user_id=users_by_email["estancias@example.com"].id, business_name="Estancias & Quintas Premium", category=ProviderCategory.VENUE, description="Estancias y quintas con parque para eventos al aire libre", phone="+54 341 555-0404"),
        Provider(user_id=users_by_email["catering@example.com"].id, business_name="Sabores Catering", category=ProviderCategory.CATERING, description="Catering completo: bodas, fiestas de 15, eventos empresariales", phone="+54 341 555-0202"),
        Provider(user_id=users_by_email["musica@example.com"].id, business_name="DJ Eventos MM", category=ProviderCategory.MUSIC, description="DJ, sonido e iluminacion profesional para cualquier evento", phone="+54 341 555-0303"),
        Provider(user_id=users_by_email["fotografia@example.com"].id, business_name="Lente Norte Fotografia", category=ProviderCategory.PHOTOGRAPHY, description="Cobertura fotografica y video de eventos sociales", phone="+54 341 555-0505"),
        Provider(user_id=users_by_email["decoracion@example.com"].id, business_name="Ambientaciones Iris", category=ProviderCategory.DECORATION, description="Ambientacion integral: flores, telas, livings y centros de mesa", phone="+54 341 555-0606"),
    ]


def build_venues(providers_by_name: dict[str, Provider]) -> list[Venue]:
    urban = providers_by_name["Salones del Litoral"]
    country = providers_by_name["Estancias & Quintas Premium"]
    return [
        Venue(provider_id=urban.id, name="Salon Centenario", description="Salon clasico en pleno centro con arana de cristal, pista de baile y barra propia. Ideal para bodas elegantes y fiestas de gala.", capacity=150, city="Rosario", address="Cordoba 1234", price=Decimal("1200000"), deposit_amount=Decimal("240000"), photos=photo_urls("salon-centenario", 3)),
        Venue(provider_id=urban.id, name="Espacio Rio Terraza", description="Rooftop con vista al rio Parana, deck al aire libre y salon climatizado. Perfecto para civiles, cocktails y eventos corporativos.", capacity=120, city="Rosario", address="Av. Belgrano 350", price=Decimal("980000"), deposit_amount=Decimal("196000"), photos=photo_urls("rio-terraza", 3)),
        Venue(provider_id=urban.id, name="Salon Mediterraneo", description="Salon moderno con techos altos, iluminacion LED programable y estacionamiento propio. Capacidad flexible para eventos medianos y grandes.", capacity=250, city="Rosario", address="Mendoza 4520", price=Decimal("1750000"), deposit_amount=Decimal("350000"), photos=photo_urls("mediterraneo", 3)),
        Venue(provider_id=country.id, name="Estancia La Arboleda", description="Casco de estancia con parque de 2 hectareas, galeria colonial y capilla propia. Ceremonias al aire libre y fiesta bajo las estrellas.", capacity=300, city="Funes", address="Ruta 9 km 12", price=Decimal("2500000"), deposit_amount=Decimal("500000"), photos=photo_urls("la-arboleda", 4)),
        Venue(provider_id=country.id, name="Quinta Los Alamos", description="Quinta con pileta, quincho cubierto y parrilla. Ambiente relajado para cumpleanos, despedidas y casamientos informales.", capacity=100, city="Funes", address="Los Alamos 567", price=Decimal("900000"), deposit_amount=Decimal("180000"), photos=photo_urls("los-alamos", 3)),
        Venue(provider_id=country.id, name="Finca El Encuentro", description="Finca boutique entre vinedos con salon vidriado y atardeceres unicos. Eventos intimos de hasta 80 invitados.", capacity=80, city="Roldan", address="Camino Real s/n", price=Decimal("1100000"), deposit_amount=Decimal("220000"), photos=photo_urls("el-encuentro", 3)),
    ]


def build_services(providers_by_name: dict[str, Provider]) -> list[Service]:
    catering = providers_by_name["Sabores Catering"]
    music = providers_by_name["DJ Eventos MM"]
    photography = providers_by_name["Lente Norte Fotografia"]
    decoration = providers_by_name["Ambientaciones Iris"]
    return [
        Service(provider_id=catering.id, name="Menu clasico (por persona)", category=ProviderCategory.CATERING, description="Recepcion con entradas frias, plato principal a eleccion, postre y mesa dulce. Incluye mozos y vajilla.", price=Decimal("35000"), photos=photo_urls("menu-clasico", 2)),
        Service(provider_id=catering.id, name="Menu premium (por persona)", category=ProviderCategory.CATERING, description="Recepcion gourmet, dos pasos principales, postre emplatado, mesa dulce y barra de tragos con bartender.", price=Decimal("55000"), photos=photo_urls("menu-premium", 2)),
        Service(provider_id=catering.id, name="Estacion de pizzas y antipasto", category=ProviderCategory.CATERING, description="Estacion en vivo para el cierre de fiesta: pizzas a la piedra y tabla de fiambres.", price=Decimal("18000"), photos=photo_urls("pizza-party", 2)),
        Service(provider_id=music.id, name="DJ + sonido e iluminacion", category=ProviderCategory.MUSIC, description="Cobertura musical completa de la fiesta: cabina DJ, sonido profesional, luces robotizadas y pantalla LED.", price=Decimal("450000"), photos=photo_urls("dj-set", 2)),
        Service(provider_id=music.id, name="Banda en vivo (set 90 min)", category=ProviderCategory.MUSIC, description="Banda de covers de 5 musicos para ceremonia o fiesta. Repertorio a medida.", price=Decimal("650000"), photos=photo_urls("banda-vivo", 2)),
        Service(provider_id=photography.id, name="Cobertura foto + video full day", category=ProviderCategory.PHOTOGRAPHY, description="Dos fotografos y un camarografo desde los preparativos hasta el final. Entrega de galeria digital y film de 5 minutos.", price=Decimal("520000"), photos=photo_urls("foto-video", 2)),
        Service(provider_id=photography.id, name="Cabina de fotos 360", category=ProviderCategory.PHOTOGRAPHY, description="Cabina 360 con props, asistente y videos listos para redes en el momento.", price=Decimal("180000"), photos=photo_urls("cabina-360", 2)),
        Service(provider_id=decoration.id, name="Ambientacion integral", category=ProviderCategory.DECORATION, description="Proyecto de ambientacion completo: flores, telas, livings, centros de mesa y cartel de bienvenida.", price=Decimal("380000"), photos=photo_urls("ambientacion", 2)),
        Service(provider_id=decoration.id, name="Arco floral para ceremonia", category=ProviderCategory.DECORATION, description="Arco de flores naturales para ceremonia civil o religiosa, con montaje y retiro incluidos.", price=Decimal("95000"), photos=photo_urls("arco-floral", 2)),
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
        venues = build_venues(providers_by_name)
        services = build_services(providers_by_name)
        session.add_all(venues)
        session.add_all(services)
        await session.commit()
        print(f"Seeded {len(users)} users, {len(providers)} providers, {len(venues)} venues, {len(services)} services")


if __name__ == "__main__":
    asyncio.run(seed())
