from fastapi import HTTPException, status

from app.core.constants import PROVIDER_ACTIONABLE_BOOKING_STATUSES
from app.models.entities import Booking, Provider
from app.models.enums import BookingStatus
from app.repositories.booking_repository import BookingRepository
from app.repositories.service_repository import ServiceRepository
from app.repositories.venue_repository import VenueRepository
from app.schemas.booking import BookingResponse
from app.schemas.provider import ProviderResponse
from app.schemas.service import ServiceResponse
from app.schemas.venue import VenueResponse


class ProviderService:
    def __init__(
        self,
        booking_repository: BookingRepository,
        venue_repository: VenueRepository,
        service_repository: ServiceRepository,
    ):
        self._booking_repository = booking_repository
        self._venue_repository = venue_repository
        self._service_repository = service_repository

    def get_profile(self, provider: Provider) -> ProviderResponse:
        return ProviderResponse.model_validate(provider)

    async def list_my_venues(self, provider: Provider) -> list[VenueResponse]:
        venues = await self._venue_repository.list_by_provider(provider.id)
        return [VenueResponse.model_validate(venue) for venue in venues]

    async def list_my_services(self, provider: Provider) -> list[ServiceResponse]:
        services = await self._service_repository.list_by_provider(provider.id)
        return [ServiceResponse.model_validate(service) for service in services]

    async def list_received_bookings(self, provider: Provider) -> list[BookingResponse]:
        bookings = await self._booking_repository.list_by_provider(provider.id)
        return [BookingResponse.model_validate(booking) for booking in bookings]

    async def confirm_booking(self, provider: Provider, booking_id: int) -> BookingResponse:
        booking = await self._get_actionable_booking(provider, booking_id)
        updated = await self._booking_repository.update_status(booking, BookingStatus.CONFIRMED)
        return BookingResponse.model_validate(updated)

    async def reject_booking(self, provider: Provider, booking_id: int) -> BookingResponse:
        booking = await self._get_actionable_booking(provider, booking_id)
        updated = await self._booking_repository.update_status(booking, BookingStatus.CANCELLED)
        return BookingResponse.model_validate(updated)

    async def _get_actionable_booking(self, provider: Provider, booking_id: int) -> Booking:
        booking = await self._booking_repository.get_by_id(booking_id)
        if booking is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        is_owner = await self._provider_owns_booking(provider, booking)
        if not is_owner:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Booking does not belong to your offerings")
        if booking.status not in PROVIDER_ACTIONABLE_BOOKING_STATUSES:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Booking is already {booking.status}")
        return booking

    async def _provider_owns_booking(self, provider: Provider, booking: Booking) -> bool:
        if booking.venue_id is not None:
            venue = await self._venue_repository.get_by_id(booking.venue_id)
            return venue is not None and venue.provider_id == provider.id
        service = await self._service_repository.get_by_id(booking.service_id)
        return service is not None and service.provider_id == provider.id
