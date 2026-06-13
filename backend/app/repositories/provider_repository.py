from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Provider


class ProviderRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_user_id(self, user_id: int) -> Provider | None:
        result = await self._session.execute(select(Provider).where(Provider.user_id == user_id))
        return result.scalar_one_or_none()

    async def get_by_id(self, provider_id: int) -> Provider | None:
        result = await self._session.execute(select(Provider).where(Provider.id == provider_id))
        return result.scalar_one_or_none()

    async def create(self, user_id: int, business_name: str, category: str) -> Provider:
        provider = Provider(user_id=user_id, business_name=business_name, category=category)
        self._session.add(provider)
        await self._session.commit()
        await self._session.refresh(provider)
        return provider

    async def update(self, provider: Provider, business_name: str, description: str, phone: str) -> Provider:
        provider.business_name = business_name
        provider.description = description
        provider.phone = phone
        await self._session.commit()
        await self._session.refresh(provider)
        return provider
