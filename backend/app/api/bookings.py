from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.dependencies import CurrentUser, get_booking_service
from app.schemas.booking import BookingCreateRequest, BookingResponse
from app.services.booking_service import BookingService

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    request: BookingCreateRequest,
    current_user: CurrentUser,
    service: Annotated[BookingService, Depends(get_booking_service)],
) -> BookingResponse:
    return await service.create_booking(current_user, request)


@router.get("", response_model=list[BookingResponse])
async def list_my_bookings(
    current_user: CurrentUser,
    service: Annotated[BookingService, Depends(get_booking_service)],
) -> list[BookingResponse]:
    return await service.list_my_bookings(current_user)


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    current_user: CurrentUser,
    service: Annotated[BookingService, Depends(get_booking_service)],
) -> BookingResponse:
    return await service.get_booking(current_user, booking_id)


@router.post("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: int,
    current_user: CurrentUser,
    service: Annotated[BookingService, Depends(get_booking_service)],
) -> BookingResponse:
    return await service.cancel_booking(current_user, booking_id)
