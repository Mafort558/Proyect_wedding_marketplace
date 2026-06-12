from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.dependencies import CurrentProvider, get_booking_service, get_venue_service
from app.schemas.booking import VenueAvailabilityResponse
from app.schemas.venue import VenueCreateRequest, VenueListResponse, VenueResponse, VenueUpdateRequest
from app.services.booking_service import BookingService
from app.services.venue_service import VenueService

router = APIRouter(prefix="/venues", tags=["venues"])


@router.get("", response_model=VenueListResponse)
async def list_venues(
    service: Annotated[VenueService, Depends(get_venue_service)],
    city: str | None = None,
    min_capacity: Annotated[int | None, Query(ge=1)] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> VenueListResponse:
    return await service.list_venues(city, min_capacity, limit, offset)


@router.get("/{venue_id}", response_model=VenueResponse)
async def get_venue(
    venue_id: int,
    service: Annotated[VenueService, Depends(get_venue_service)],
) -> VenueResponse:
    return await service.get_venue(venue_id)


@router.post("", response_model=VenueResponse, status_code=status.HTTP_201_CREATED)
async def create_venue(
    request: VenueCreateRequest,
    provider: CurrentProvider,
    service: Annotated[VenueService, Depends(get_venue_service)],
) -> VenueResponse:
    return await service.create_venue(provider, request)


@router.put("/{venue_id}", response_model=VenueResponse)
async def update_venue(
    venue_id: int,
    request: VenueUpdateRequest,
    provider: CurrentProvider,
    service: Annotated[VenueService, Depends(get_venue_service)],
) -> VenueResponse:
    return await service.update_venue(provider, venue_id, request)


@router.delete("/{venue_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_venue(
    venue_id: int,
    provider: CurrentProvider,
    service: Annotated[VenueService, Depends(get_venue_service)],
) -> None:
    await service.delete_venue(provider, venue_id)


@router.get("/{venue_id}/availability", response_model=VenueAvailabilityResponse)
async def get_venue_availability(
    venue_id: int,
    service: Annotated[BookingService, Depends(get_booking_service)],
    date_from: date | None = None,
    date_to: date | None = None,
) -> VenueAvailabilityResponse:
    return await service.get_venue_availability(venue_id, date_from, date_to)
