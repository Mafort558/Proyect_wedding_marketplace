from fastapi import APIRouter

from app.api import (
    auth,
    bookings,
    favorites,
    health,
    messages,
    notifications,
    packages,
    payments,
    providers,
    reviews,
    services,
    venues,
)


def build_api_router() -> APIRouter:
    api_router = APIRouter(prefix="/api")
    api_router.include_router(health.router)
    api_router.include_router(auth.router)
    api_router.include_router(venues.router)
    api_router.include_router(services.router)
    api_router.include_router(packages.router)
    api_router.include_router(providers.router)
    api_router.include_router(bookings.router)
    api_router.include_router(payments.router)
    api_router.include_router(reviews.router)
    api_router.include_router(favorites.router)
    api_router.include_router(notifications.router)
    api_router.include_router(messages.router)
    return api_router
