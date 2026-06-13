from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.dependencies import CurrentProvider, get_package_service
from app.schemas.package import (
    PackageCreateRequest,
    PackageListResponse,
    PackageResponse,
    PackageUpdateRequest,
)
from app.services.package_service import PackageService

router = APIRouter(prefix="/packages", tags=["packages"])


@router.get("/mine", response_model=PackageListResponse)
async def list_my_packages(
    provider: CurrentProvider,
    service: Annotated[PackageService, Depends(get_package_service)],
) -> PackageListResponse:
    return await service.list_by_provider(provider.id)


@router.get("/{package_id}", response_model=PackageResponse)
async def get_package(
    package_id: int,
    service: Annotated[PackageService, Depends(get_package_service)],
) -> PackageResponse:
    return await service.get_package(package_id)


@router.post("", response_model=PackageResponse, status_code=status.HTTP_201_CREATED)
async def create_package(
    request: PackageCreateRequest,
    provider: CurrentProvider,
    service: Annotated[PackageService, Depends(get_package_service)],
) -> PackageResponse:
    return await service.create_package(provider, request)


@router.put("/{package_id}", response_model=PackageResponse)
async def update_package(
    package_id: int,
    request: PackageUpdateRequest,
    provider: CurrentProvider,
    service: Annotated[PackageService, Depends(get_package_service)],
) -> PackageResponse:
    return await service.update_package(provider, package_id, request)


@router.delete("/{package_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_package(
    package_id: int,
    provider: CurrentProvider,
    service: Annotated[PackageService, Depends(get_package_service)],
) -> None:
    await service.delete_package(provider, package_id)
