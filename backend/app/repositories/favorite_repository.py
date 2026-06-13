from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Favorite, Service, Venue


class FavoriteRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def find(self, user_id: int, venue_id: int | None, service_id: int | None) -> Favorite | None:
        query = select(Favorite).where(Favorite.user_id == user_id)
        if venue_id is not None:
            query = query.where(Favorite.venue_id == venue_id)
        if service_id is not None:
            query = query.where(Favorite.service_id == service_id)
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def add(self, user_id: int, venue_id: int | None, service_id: int | None) -> Favorite:
        favorite = Favorite(user_id=user_id, venue_id=venue_id, service_id=service_id)
        self._session.add(favorite)
        await self._session.commit()
        await self._session.refresh(favorite)
        return favorite

    async def remove(self, favorite: Favorite) -> None:
        await self._session.delete(favorite)
        await self._session.commit()

    async def list_venues(self, user_id: int) -> list[Venue]:
        query = (
            select(Venue)
            .join(Favorite, Favorite.venue_id == Venue.id)
            .where(Favorite.user_id == user_id)
            .order_by(Favorite.id.desc())
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def list_services(self, user_id: int) -> list[Service]:
        query = (
            select(Service)
            .join(Favorite, Favorite.service_id == Service.id)
            .where(Favorite.user_id == user_id)
            .order_by(Favorite.id.desc())
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def list_venue_ids(self, user_id: int) -> list[int]:
        query = select(Favorite.venue_id).where(Favorite.user_id == user_id, Favorite.venue_id.is_not(None))
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def list_service_ids(self, user_id: int) -> list[int]:
        query = select(Favorite.service_id).where(Favorite.user_id == user_id, Favorite.service_id.is_not(None))
        result = await self._session.execute(query)
        return list(result.scalars().all())
