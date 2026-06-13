from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Package


class PackageRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_id(self, package_id: int) -> Package | None:
        result = await self._session.execute(select(Package).where(Package.id == package_id))
        return result.scalar_one_or_none()

    async def list_by_provider(self, provider_id: int) -> list[Package]:
        result = await self._session.execute(
            select(Package).where(Package.provider_id == provider_id).order_by(Package.id)
        )
        return list(result.scalars().all())

    async def create(self, provider_id: int, fields: dict) -> Package:
        package = Package(provider_id=provider_id, **fields)
        self._session.add(package)
        await self._session.commit()
        await self._session.refresh(package)
        return package

    async def update(self, package: Package, fields: dict) -> Package:
        for key, value in fields.items():
            setattr(package, key, value)
        await self._session.commit()
        await self._session.refresh(package)
        return package

    async def delete(self, package: Package) -> None:
        await self._session.delete(package)
        await self._session.commit()
