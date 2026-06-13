from datetime import date
from decimal import Decimal

from fastapi import HTTPException, status

from app.core.constants import (
    BLOCKING_BOOKING_STATUSES,
    NOTIFICATION_BOOKING_CONFIRMED,
    NOTIFICATION_BOOKING_REJECTED,
    NOTIFICATION_BOOKINGS_LINK,
    PROVIDER_ACTIONABLE_BOOKING_STATUSES,
)
from app.models.entities import Booking, Provider
from app.models.enums import BookingStatus
from app.repositories.booking_repository import BookingRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.package_repository import PackageRepository
from app.repositories.provider_repository import ProviderRepository
from app.repositories.review_repository import ReviewRepository
from app.repositories.service_repository import ServiceRepository
from app.repositories.venue_repository import VenueRepository
from app.schemas.booking import BookingResponse
from app.schemas.package import PackageResponse
from app.schemas.provider import (
    ProviderDashboardResponse,
    ProviderPublicResponse,
    ProviderResponse,
    ProviderUpdateRequest,
)
from app.schemas.service import ServiceResponse
from app.schemas.venue import VenueResponse


class ProviderService:
    def __init__(
        self,
        booking_repository: BookingRepository,
        venue_repository: VenueRepository,
        service_repository: ServiceRepository,
        provider_repository: ProviderRepository,
        review_repository: ReviewRepository,
        notification_repository: NotificationRepository,
        package_repository: PackageRepository,
    ):
        self._booking_repository = booking_repository
        self._venue_repository = venue_repository
        self._service_repository = service_repository
        self._provider_repository = provider_repository
        self._review_repository = review_repository
        self._notifications = notification_repository
        self._package_repository = package_repository

    def get_profile(self, provider: Provider) -> ProviderResponse:
        return ProviderResponse.model_validate(provider)

    async def update_profile(self, provider: Provider, request: ProviderUpdateRequest) -> ProviderResponse:
        updated = await self._provider_repository.update(
            provider, request.business_name, request.description, request.phone
        )
        return ProviderResponse.model_validate(updated)

    async def get_dashboard(self, provider: Provider) -> ProviderDashboardResponse:
        venues = await self._venue_repository.list_by_provider(provider.id)
        services = await self._service_repository.list_by_provider(provider.id)
        bookings = await self._booking_repository.list_by_provider(provider.id)
        rating, review_count = await self._review_repository.rating_summary_for_targets(
            [venue.id for venue in venues], [service.id for service in services]
        )
        bookings_by_status = {status_value: 0 for status_value in BookingStatus}
        confirmed_revenue = Decimal("0")
        upcoming_events = 0
        today = date.today()
        for booking in bookings:
            bookings_by_status[booking.status] += 1
            if booking.status in BLOCKING_BOOKING_STATUSES:
                confirmed_revenue += booking.total_price
            if booking.status != BookingStatus.CANCELLED and booking.event_date >= today:
                upcoming_events += 1
        return ProviderDashboardResponse(
            total_venues=len(venues),
            total_services=len(services),
            total_bookings=len(bookings),
            bookings_by_status=bookings_by_status,
            confirmed_revenue=confirmed_revenue,
            upcoming_events=upcoming_events,
            rating=round(rating, 2) if rating is not None else None,
            review_count=review_count,
        )

    async def get_public_profile(self, provider_id: int) -> ProviderPublicResponse:
        provider = await self._provider_repository.get_by_id(provider_id)
        if provider is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found")
        venues = await self._venue_repository.list_by_provider(provider.id)
        services = await self._service_repository.list_by_provider(provider.id)
        packages = await self._package_repository.list_by_provider(provider.id)
        rating, review_count = await self._review_repository.rating_summary_for_targets(
            [venue.id for venue in venues], [service.id for service in services]
        )
        return ProviderPublicResponse(
            id=provider.id,
            user_id=provider.user_id,
            business_name=provider.business_name,
            category=provider.category,
            description=provider.description,
            phone=provider.phone,
            created_at=provider.created_at,
            rating=round(rating, 2) if rating is not None else None,
            review_count=review_count,
            venues=[VenueResponse.model_validate(venue) for venue in venues],
            services=[ServiceResponse.model_validate(service) for service in services],
            packages=[PackageResponse.model_validate(package) for package in packages],
        )

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
        await self._notifications.create(
            user_id=updated.user_id,
            type=NOTIFICATION_BOOKING_CONFIRMED,
            title="Reserva confirmada",
            body=f"{provider.business_name} confirmó tu reserva",
            link=NOTIFICATION_BOOKINGS_LINK,
        )
        return BookingResponse.model_validate(updated)

    async def reject_booking(self, provider: Provider, booking_id: int) -> BookingResponse:
        booking = await self._get_actionable_booking(provider, booking_id)
        updated = await self._booking_repository.update_status(booking, BookingStatus.CANCELLED)
        await self._notifications.create(
            user_id=updated.user_id,
            type=NOTIFICATION_BOOKING_REJECTED,
            title="Reserva rechazada",
            body=f"{provider.business_name} rechazó tu reserva",
            link=NOTIFICATION_BOOKINGS_LINK,
        )
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
