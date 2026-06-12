from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Service


class ServiceRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_id(self, service_id: int) -> Service | None:
        result = await self._session.execute(select(Service).where(Service.id == service_id))
        return result.scalar_one_or_none()

    async def list_services(self, category: str | None, limit: int, offset: int) -> tuple[list[Service], int]:
        query = select(Service)
        if category is not None:
            query = query.where(Service.category == category)
        count_query = select(func.count()).select_from(query.subquery())
        total = (await self._session.execute(count_query)).scalar_one()
        result = await self._session.execute(query.order_by(Service.id).limit(limit).offset(offset))
        return list(result.scalars().all()), total

    async def create(self, provider_id: int, fields: dict) -> Service:
        service = Service(provider_id=provider_id, **fields)
        self._session.add(service)
        await self._session.commit()
        await self._session.refresh(service)
        return service

    async def update(self, service: Service, fields: dict) -> Service:
        for key, value in fields.items():
            setattr(service, key, value)
        await self._session.commit()
        await self._session.refresh(service)
        return service

    async def delete(self, service: Service) -> None:
        await self._session.delete(service)
        await self._session.commit()
