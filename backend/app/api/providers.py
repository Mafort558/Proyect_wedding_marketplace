from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentProvider, get_provider_service
from app.schemas.booking import BookingResponse
from app.schemas.provider import (
    ProviderDashboardResponse,
    ProviderPublicResponse,
    ProviderResponse,
    ProviderUpdateRequest,
)
from app.schemas.service import ServiceResponse
from app.schemas.venue import VenueResponse
from app.services.provider_service import ProviderService

router = APIRouter(prefix="/providers", tags=["providers"])


@router.get("/me", response_model=ProviderResponse)
async def get_my_profile(
    provider: CurrentProvider,
    service: Annotated[ProviderService, Depends(get_provider_service)],
) -> ProviderResponse:
    return service.get_profile(provider)


@router.patch("/me", response_model=ProviderResponse)
async def update_my_profile(
    request: ProviderUpdateRequest,
    provider: CurrentProvider,
    service: Annotated[ProviderService, Depends(get_provider_service)],
) -> ProviderResponse:
    return await service.update_profile(provider, request)


@router.get("/me/dashboard", response_model=ProviderDashboardResponse)
async def get_dashboard(
    provider: CurrentProvider,
    service: Annotated[ProviderService, Depends(get_provider_service)],
) -> ProviderDashboardResponse:
    return await service.get_dashboard(provider)


@router.get("/me/venues", response_model=list[VenueResponse])
async def list_my_venues(
    provider: CurrentProvider,
    service: Annotated[ProviderService, Depends(get_provider_service)],
) -> list[VenueResponse]:
    return await service.list_my_venues(provider)


@router.get("/me/services", response_model=list[ServiceResponse])
async def list_my_services(
    provider: CurrentProvider,
    service: Annotated[ProviderService, Depends(get_provider_service)],
) -> list[ServiceResponse]:
    return await service.list_my_services(provider)


@router.get("/me/bookings", response_model=list[BookingResponse])
async def list_received_bookings(
    provider: CurrentProvider,
    service: Annotated[ProviderService, Depends(get_provider_service)],
) -> list[BookingResponse]:
    return await service.list_received_bookings(provider)


@router.post("/me/bookings/{booking_id}/confirm", response_model=BookingResponse)
async def confirm_booking(
    booking_id: int,
    provider: CurrentProvider,
    service: Annotated[ProviderService, Depends(get_provider_service)],
) -> BookingResponse:
    return await service.confirm_booking(provider, booking_id)


@router.post("/me/bookings/{booking_id}/reject", response_model=BookingResponse)
async def reject_booking(
    booking_id: int,
    provider: CurrentProvider,
    service: Annotated[ProviderService, Depends(get_provider_service)],
) -> BookingResponse:
    return await service.reject_booking(provider, booking_id)


@router.get("/{provider_id}", response_model=ProviderPublicResponse)
async def get_public_profile(
    provider_id: int,
    service: Annotated[ProviderService, Depends(get_provider_service)],
) -> ProviderPublicResponse:
    return await service.get_public_profile(provider_id)
