from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, get_favorite_service
from app.schemas.favorite import (
    FavoriteIdsResponse,
    FavoriteListResponse,
    FavoriteToggleRequest,
    FavoriteToggleResponse,
)
from app.services.favorite_service import FavoriteService

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=FavoriteListResponse)
async def list_favorites(
    current_user: CurrentUser,
    service: Annotated[FavoriteService, Depends(get_favorite_service)],
) -> FavoriteListResponse:
    return await service.list_favorites(current_user)


@router.get("/ids", response_model=FavoriteIdsResponse)
async def list_favorite_ids(
    current_user: CurrentUser,
    service: Annotated[FavoriteService, Depends(get_favorite_service)],
) -> FavoriteIdsResponse:
    return await service.list_ids(current_user)


@router.post("/toggle", response_model=FavoriteToggleResponse)
async def toggle_favorite(
    request: FavoriteToggleRequest,
    current_user: CurrentUser,
    service: Annotated[FavoriteService, Depends(get_favorite_service)],
) -> FavoriteToggleResponse:
    return await service.toggle(current_user, request)
