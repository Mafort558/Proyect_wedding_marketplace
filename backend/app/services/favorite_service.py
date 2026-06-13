from app.models.entities import User
from app.repositories.favorite_repository import FavoriteRepository
from app.schemas.favorite import (
    FavoriteIdsResponse,
    FavoriteListResponse,
    FavoriteToggleRequest,
    FavoriteToggleResponse,
)
from app.schemas.service import ServiceResponse
from app.schemas.venue import VenueResponse


class FavoriteService:
    def __init__(self, repository: FavoriteRepository):
        self._repository = repository

    async def toggle(self, user: User, request: FavoriteToggleRequest) -> FavoriteToggleResponse:
        existing = await self._repository.find(user.id, request.venue_id, request.service_id)
        if existing is not None:
            await self._repository.remove(existing)
            return FavoriteToggleResponse(favorited=False)
        await self._repository.add(user.id, request.venue_id, request.service_id)
        return FavoriteToggleResponse(favorited=True)

    async def list_favorites(self, user: User) -> FavoriteListResponse:
        venues = await self._repository.list_venues(user.id)
        services = await self._repository.list_services(user.id)
        return FavoriteListResponse(
            venues=[VenueResponse.model_validate(venue) for venue in venues],
            services=[ServiceResponse.model_validate(service) for service in services],
        )

    async def list_ids(self, user: User) -> FavoriteIdsResponse:
        return FavoriteIdsResponse(
            venue_ids=await self._repository.list_venue_ids(user.id),
            service_ids=await self._repository.list_service_ids(user.id),
        )
