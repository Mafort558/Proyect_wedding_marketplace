from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentProvider, get_provider_service
from app.schemas.booking import BookingResponse
from app.schemas.provider import ProviderResponse
from app.services.provider_service import ProviderService

router = APIRouter(prefix="/providers", tags=["providers"])


@router.get("/me", response_model=ProviderResponse)
async def get_my_profile(
    provider: CurrentProvider,
    service: Annotated[ProviderService, Depends(get_provider_service)],
) -> ProviderResponse:
    return service.get_profile(provider)


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
