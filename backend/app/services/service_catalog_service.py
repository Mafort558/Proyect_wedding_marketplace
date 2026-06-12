from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.models.entities import Provider, Service
from app.repositories.service_repository import ServiceRepository
from app.schemas.service import ServiceCreateRequest, ServiceListResponse, ServiceResponse, ServiceUpdateRequest


class ServiceCatalogService:
    def __init__(self, repository: ServiceRepository):
        self._repository = repository

    async def list_services(self, category: str | None, limit: int, offset: int) -> ServiceListResponse:
        services, total = await self._repository.list_services(category, limit, offset)
        items = [ServiceResponse.model_validate(service) for service in services]
        return ServiceListResponse(items=items, total=total)

    async def get_service(self, service_id: int) -> ServiceResponse:
        service = await self._repository.get_by_id(service_id)
        if service is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
        return ServiceResponse.model_validate(service)

    async def create_service(self, provider: Provider, request: ServiceCreateRequest) -> ServiceResponse:
        service = await self._repository.create(provider.id, request.model_dump())
        return ServiceResponse.model_validate(service)

    async def update_service(self, provider: Provider, service_id: int, request: ServiceUpdateRequest) -> ServiceResponse:
        service = await self._get_owned_service(provider, service_id)
        updated = await self._repository.update(service, request.model_dump(exclude_unset=True))
        return ServiceResponse.model_validate(updated)

    async def delete_service(self, provider: Provider, service_id: int) -> None:
        service = await self._get_owned_service(provider, service_id)
        try:
            await self._repository.delete(service)
        except IntegrityError:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Service has bookings and cannot be deleted")

    async def _get_owned_service(self, provider: Provider, service_id: int) -> Service:
        service = await self._repository.get_by_id(service_id)
        if service is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
        if service.provider_id != provider.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your service")
        return service
