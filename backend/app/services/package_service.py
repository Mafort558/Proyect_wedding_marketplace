from fastapi import HTTPException, status

from app.models.entities import Package, Provider
from app.repositories.package_repository import PackageRepository
from app.repositories.service_repository import ServiceRepository
from app.schemas.package import (
    PackageCreateRequest,
    PackageListResponse,
    PackageResponse,
    PackageUpdateRequest,
)


class PackageService:
    def __init__(self, repository: PackageRepository, service_repository: ServiceRepository):
        self._repository = repository
        self._service_repository = service_repository

    async def list_by_provider(self, provider_id: int) -> PackageListResponse:
        packages = await self._repository.list_by_provider(provider_id)
        items = [PackageResponse.model_validate(package) for package in packages]
        return PackageListResponse(items=items, total=len(items))

    async def get_package(self, package_id: int) -> PackageResponse:
        package = await self._repository.get_by_id(package_id)
        if package is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
        return PackageResponse.model_validate(package)

    async def create_package(self, provider: Provider, request: PackageCreateRequest) -> PackageResponse:
        await self._validate_service_ids(provider, request.service_ids)
        package = await self._repository.create(provider.id, request.model_dump())
        return PackageResponse.model_validate(package)

    async def update_package(self, provider: Provider, package_id: int, request: PackageUpdateRequest) -> PackageResponse:
        package = await self._get_owned_package(provider, package_id)
        fields = request.model_dump(exclude_unset=True)
        if "service_ids" in fields:
            await self._validate_service_ids(provider, fields["service_ids"])
        updated = await self._repository.update(package, fields)
        return PackageResponse.model_validate(updated)

    async def delete_package(self, provider: Provider, package_id: int) -> None:
        package = await self._get_owned_package(provider, package_id)
        await self._repository.delete(package)

    async def _get_owned_package(self, provider: Provider, package_id: int) -> Package:
        package = await self._repository.get_by_id(package_id)
        if package is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
        if package.provider_id != provider.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your package")
        return package

    async def _validate_service_ids(self, provider: Provider, service_ids: list[int]) -> None:
        owned_services = await self._service_repository.list_by_provider(provider.id)
        owned_ids = {service.id for service in owned_services}
        if not set(service_ids).issubset(owned_ids):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Package must only include your own services")
