from datetime import date
from decimal import Decimal

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import BLOCKING_BOOKING_STATUSES
from app.models.entities import Booking, Service, Venue
from app.models.enums import BookingStatus


class BookingRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, user_id: int, venue_id: int | None, service_id: int | None, event_date: date, total_price: Decimal) -> Booking:
        booking = Booking(
            user_id=user_id,
            venue_id=venue_id,
            service_id=service_id,
            event_date=event_date,
            total_price=total_price,
        )
        self._session.add(booking)
        await self._session.commit()
        await self._session.refresh(booking)
        return booking

    async def get_by_id(self, booking_id: int) -> Booking | None:
        result = await self._session.execute(select(Booking).where(Booking.id == booking_id))
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: int) -> list[Booking]:
        query = select(Booking).where(Booking.user_id == user_id).order_by(Booking.event_date)
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def list_by_provider(self, provider_id: int) -> list[Booking]:
        query = (
            select(Booking)
            .outerjoin(Venue, Booking.venue_id == Venue.id)
            .outerjoin(Service, Booking.service_id == Service.id)
            .where(or_(Venue.provider_id == provider_id, Service.provider_id == provider_id))
            .order_by(Booking.event_date)
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def user_has_booking_for_target(
        self,
        user_id: int,
        venue_id: int | None,
        service_id: int | None,
        statuses: tuple[BookingStatus, ...],
    ) -> bool:
        query = select(Booking.id).where(Booking.user_id == user_id, Booking.status.in_(statuses))
        if venue_id is not None:
            query = query.where(Booking.venue_id == venue_id)
        if service_id is not None:
            query = query.where(Booking.service_id == service_id)
        result = await self._session.execute(query)
        return result.first() is not None

    async def venue_has_blocking_booking(self, venue_id: int, event_date: date) -> bool:
        query = select(Booking.id).where(
            Booking.venue_id == venue_id,
            Booking.event_date == event_date,
            Booking.status.in_(BLOCKING_BOOKING_STATUSES),
        )
        result = await self._session.execute(query)
        return result.first() is not None

    async def list_blocked_dates(self, venue_id: int, date_from: date, date_to: date) -> list[date]:
        query = (
            select(Booking.event_date)
            .where(
                Booking.venue_id == venue_id,
                Booking.event_date >= date_from,
                Booking.event_date <= date_to,
                Booking.status.in_(BLOCKING_BOOKING_STATUSES),
            )
            .order_by(Booking.event_date)
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def update_status(self, booking: Booking, new_status: BookingStatus) -> Booking:
        booking.status = new_status
        await self._session.commit()
        await self._session.refresh(booking)
        return booking
