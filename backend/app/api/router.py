from fastapi import APIRouter

from app.api import auth, bookings, health, payments, providers, services, venues


def build_api_router() -> APIRouter:
    api_router = APIRouter(prefix="/api")
    api_router.include_router(health.router)
    api_router.include_router(auth.router)
    api_router.include_router(venues.router)
    api_router.include_router(services.router)
    api_router.include_router(providers.router)
    api_router.include_router(bookings.router)
    api_router.include_router(payments.router)
    return api_router
