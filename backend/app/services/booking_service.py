from datetime import date, timedelta

from fastapi import HTTPException, status

from app.core.constants import (
    DEFAULT_AVAILABILITY_WINDOW_DAYS,
    NOTIFICATION_BOOKING_RECEIVED,
    NOTIFICATION_PANEL_LINK,
)
from app.models.entities import User
from app.models.enums import BookingStatus
from app.repositories.booking_repository import BookingRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.provider_repository import ProviderRepository
from app.repositories.service_repository import ServiceRepository
from app.repositories.venue_repository import VenueRepository
from app.schemas.booking import BookingCreateRequest, BookingResponse, VenueAvailabilityResponse


class BookingService:
    def __init__(
        self,
        booking_repository: BookingRepository,
        venue_repository: VenueRepository,
        service_repository: ServiceRepository,
        provider_repository: ProviderRepository,
        notification_repository: NotificationRepository,
    ):
        self._booking_repository = booking_repository
        self._venue_repository = venue_repository
        self._service_repository = service_repository
        self._provider_repository = provider_repository
        self._notifications = notification_repository

    async def create_booking(self, current_user: User, request: BookingCreateRequest) -> BookingResponse:
        if request.event_date <= date.today():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="event_date must be in the future")
        if request.venue_id is not None:
            return await self._create_venue_booking(current_user, request)
        return await self._create_service_booking(current_user, request)

    async def _create_venue_booking(self, current_user: User, request: BookingCreateRequest) -> BookingResponse:
        venue = await self._venue_repository.get_by_id(request.venue_id)
        if venue is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
        is_blocked = await self._booking_repository.venue_has_blocking_booking(venue.id, request.event_date)
        if is_blocked:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Venue not available on that date")
        booking = await self._booking_repository.create(
            user_id=current_user.id,
            venue_id=venue.id,
            service_id=None,
            event_date=request.event_date,
            total_price=venue.price,
        )
        await self._notify_provider(venue.provider_id, current_user, venue.name)
        return BookingResponse.model_validate(booking)

    async def _create_service_booking(self, current_user: User, request: BookingCreateRequest) -> BookingResponse:
        service = await self._service_repository.get_by_id(request.service_id)
        if service is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
        booking = await self._booking_repository.create(
            user_id=current_user.id,
            venue_id=None,
            service_id=service.id,
            event_date=request.event_date,
            total_price=service.price,
        )
        await self._notify_provider(service.provider_id, current_user, service.name)
        return BookingResponse.model_validate(booking)

    async def _notify_provider(self, provider_id: int, client: User, offering_name: str) -> None:
        provider = await self._provider_repository.get_by_id(provider_id)
        if provider is None:
            return
        await self._notifications.create(
            user_id=provider.user_id,
            type=NOTIFICATION_BOOKING_RECEIVED,
            title="Nueva reserva recibida",
            body=f"{client.full_name} reservó {offering_name}",
            link=NOTIFICATION_PANEL_LINK,
        )

    async def list_my_bookings(self, current_user: User) -> list[BookingResponse]:
        bookings = await self._booking_repository.list_by_user(current_user.id)
        return [BookingResponse.model_validate(booking) for booking in bookings]

    async def get_booking(self, current_user: User, booking_id: int) -> BookingResponse:
        booking = await self._get_owned_booking(current_user, booking_id)
        return BookingResponse.model_validate(booking)

    async def cancel_booking(self, current_user: User, booking_id: int) -> BookingResponse:
        booking = await self._get_owned_booking(current_user, booking_id)
        if booking.status == BookingStatus.CANCELLED:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Booking already cancelled")
        updated = await self._booking_repository.update_status(booking, BookingStatus.CANCELLED)
        return BookingResponse.model_validate(updated)

    async def get_venue_availability(self, venue_id: int, date_from: date | None, date_to: date | None) -> VenueAvailabilityResponse:
        venue = await self._venue_repository.get_by_id(venue_id)
        if venue is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
        start_date = date_from or date.today()
        end_date = date_to or start_date + timedelta(days=DEFAULT_AVAILABILITY_WINDOW_DAYS)
        if end_date < start_date:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="date_to must be after date_from")
        blocked_dates = await self._booking_repository.list_blocked_dates(venue_id, start_date, end_date)
        return VenueAvailabilityResponse(venue_id=venue_id, booked_dates=blocked_dates)

    async def _get_owned_booking(self, current_user: User, booking_id: int):
        booking = await self._booking_repository.get_by_id(booking_id)
        if booking is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        if booking.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your booking")
        return booking
