from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Venue


class VenueRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_venues(self, city: str | None, min_capacity: int | None, limit: int, offset: int) -> tuple[list[Venue], int]:
        query = select(Venue)
        if city is not None:
            query = query.where(Venue.city.ilike(city))
        if min_capacity is not None:
            query = query.where(Venue.capacity >= min_capacity)
        count_query = select(func.count()).select_from(query.subquery())
        total = (await self._session.execute(count_query)).scalar_one()
        result = await self._session.execute(query.order_by(Venue.id).limit(limit).offset(offset))
        return list(result.scalars().all()), total

    async def list_by_provider(self, provider_id: int) -> list[Venue]:
        result = await self._session.execute(select(Venue).where(Venue.provider_id == provider_id).order_by(Venue.id))
        return list(result.scalars().all())

    async def get_by_id(self, venue_id: int) -> Venue | None:
        result = await self._session.execute(select(Venue).where(Venue.id == venue_id))
        return result.scalar_one_or_none()

    async def create(self, provider_id: int, fields: dict) -> Venue:
        venue = Venue(provider_id=provider_id, **fields)
        self._session.add(venue)
        await self._session.commit()
        await self._session.refresh(venue)
        return venue

    async def update(self, venue: Venue, fields: dict) -> Venue:
        for key, value in fields.items():
            setattr(venue, key, value)
        await self._session.commit()
        await self._session.refresh(venue)
        return venue

    async def delete(self, venue: Venue) -> None:
        await self._session.delete(venue)
        await self._session.commit()
