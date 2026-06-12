from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import decode_access_token
from app.db.session import get_db_session
from app.integrations.mercadopago_client import MercadoPagoClient
from app.models.entities import Provider, User
from app.models.enums import UserRole
from app.repositories.booking_repository import BookingRepository
from app.repositories.payment_repository import PaymentRepository
from app.repositories.provider_repository import ProviderRepository
from app.repositories.service_repository import ServiceRepository
from app.repositories.user_repository import UserRepository
from app.repositories.venue_repository import VenueRepository
from app.services.auth_service import AuthService
from app.services.booking_service import BookingService
from app.services.payment_service import PaymentService
from app.services.provider_service import ProviderService
from app.services.service_catalog_service import ServiceCatalogService
from app.services.venue_service import VenueService

bearer_scheme = HTTPBearer()

DbSession = Annotated[AsyncSession, Depends(get_db_session)]


def get_venue_service(session: DbSession) -> VenueService:
    return VenueService(VenueRepository(session))


def get_auth_service(session: DbSession) -> AuthService:
    return AuthService(UserRepository(session), ProviderRepository(session))


def get_booking_service(session: DbSession) -> BookingService:
    return BookingService(BookingRepository(session), VenueRepository(session), ServiceRepository(session))


def get_service_catalog_service(session: DbSession) -> ServiceCatalogService:
    return ServiceCatalogService(ServiceRepository(session))


def get_provider_service(session: DbSession) -> ProviderService:
    return ProviderService(BookingRepository(session), VenueRepository(session), ServiceRepository(session))


def get_payment_service(session: DbSession) -> PaymentService:
    settings = get_settings()
    mp_client = MercadoPagoClient(settings.mp_access_token, settings.mp_api_base_url)
    return PaymentService(
        PaymentRepository(session),
        BookingRepository(session),
        VenueRepository(session),
        mp_client,
        settings,
    )


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    session: DbSession,
) -> User:
    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = await UserRepository(session).get_by_id(int(payload["sub"]))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


async def get_current_provider(current_user: CurrentUser, session: DbSession) -> Provider:
    if current_user.role != UserRole.PROVIDER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Provider role required")
    provider = await ProviderRepository(session).get_by_user_id(current_user.id)
    if provider is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Provider profile not found")
    return provider


CurrentProvider = Annotated[Provider, Depends(get_current_provider)]
