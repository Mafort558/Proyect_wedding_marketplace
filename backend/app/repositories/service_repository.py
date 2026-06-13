from decimal import Decimal

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Service

SERVICE_SORT_OPTIONS = {
    "price_asc": Service.price.asc(),
    "price_desc": Service.price.desc(),
    "recent": Service.created_at.desc(),
}


class ServiceRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_id(self, service_id: int) -> Service | None:
        result = await self._session.execute(select(Service).where(Service.id == service_id))
        return result.scalar_one_or_none()

    async def list_by_provider(self, provider_id: int) -> list[Service]:
        result = await self._session.execute(select(Service).where(Service.provider_id == provider_id).order_by(Service.id))
        return list(result.scalars().all())

    async def list_services(
        self,
        category: str | None,
        query_text: str | None,
        min_price: Decimal | None,
        max_price: Decimal | None,
        sort: str | None,
        limit: int,
        offset: int,
    ) -> tuple[list[Service], int]:
        query = select(Service)
        if category is not None:
            query = query.where(Service.category == category)
        if query_text is not None:
            pattern = f"%{query_text}%"
            query = query.where(or_(Service.name.ilike(pattern), Service.description.ilike(pattern)))
        if min_price is not None:
            query = query.where(Service.price >= min_price)
        if max_price is not None:
            query = query.where(Service.price <= max_price)
        count_query = select(func.count()).select_from(query.subquery())
        total = (await self._session.execute(count_query)).scalar_one()
        order = SERVICE_SORT_OPTIONS.get(sort, Service.id.asc())
        result = await self._session.execute(query.order_by(order).limit(limit).offset(offset))
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
