from decimal import Decimal
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query, status

from app.api.dependencies import CurrentProvider, get_service_catalog_service
from app.models.enums import ProviderCategory
from app.schemas.service import ServiceCreateRequest, ServiceListResponse, ServiceResponse, ServiceUpdateRequest
from app.services.service_catalog_service import ServiceCatalogService

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=ServiceListResponse)
async def list_services(
    service: Annotated[ServiceCatalogService, Depends(get_service_catalog_service)],
    category: ProviderCategory | None = None,
    q: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    min_price: Annotated[Decimal | None, Query(ge=0)] = None,
    max_price: Annotated[Decimal | None, Query(ge=0)] = None,
    sort: Literal["price_asc", "price_desc", "recent"] | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> ServiceListResponse:
    return await service.list_services(category, q, min_price, max_price, sort, limit, offset)


@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(
    service_id: int,
    service: Annotated[ServiceCatalogService, Depends(get_service_catalog_service)],
) -> ServiceResponse:
    return await service.get_service(service_id)


@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    request: ServiceCreateRequest,
    provider: CurrentProvider,
    service: Annotated[ServiceCatalogService, Depends(get_service_catalog_service)],
) -> ServiceResponse:
    return await service.create_service(provider, request)


@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: int,
    request: ServiceUpdateRequest,
    provider: CurrentProvider,
    service: Annotated[ServiceCatalogService, Depends(get_service_catalog_service)],
) -> ServiceResponse:
    return await service.update_service(provider, service_id, request)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    provider: CurrentProvider,
    service: Annotated[ServiceCatalogService, Depends(get_service_catalog_service)],
) -> None:
    await service.delete_service(provider, service_id)
