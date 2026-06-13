from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.models.entities import Provider, Venue
from app.repositories.venue_repository import VenueRepository
from app.schemas.venue import VenueCreateRequest, VenueListResponse, VenueResponse, VenueUpdateRequest


class VenueService:
    def __init__(self, repository: VenueRepository):
        self._repository = repository

    async def list_venues(
        self,
        city: str | None,
        min_capacity: int | None,
        query_text: str | None,
        min_price: Decimal | None,
        max_price: Decimal | None,
        sort: str | None,
        limit: int,
        offset: int,
    ) -> VenueListResponse:
        venues, total = await self._repository.list_venues(
            city, min_capacity, query_text, min_price, max_price, sort, limit, offset
        )
        items = [VenueResponse.model_validate(venue) for venue in venues]
        return VenueListResponse(items=items, total=total)

    async def get_venue(self, venue_id: int) -> VenueResponse:
        venue = await self._repository.get_by_id(venue_id)
        if venue is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
        return VenueResponse.model_validate(venue)

    async def create_venue(self, provider: Provider, request: VenueCreateRequest) -> VenueResponse:
        venue = await self._repository.create(provider.id, request.model_dump())
        return VenueResponse.model_validate(venue)

    async def update_venue(self, provider: Provider, venue_id: int, request: VenueUpdateRequest) -> VenueResponse:
        venue = await self._get_owned_venue(provider, venue_id)
        updated = await self._repository.update(venue, request.model_dump(exclude_unset=True))
        return VenueResponse.model_validate(updated)

    async def delete_venue(self, provider: Provider, venue_id: int) -> None:
        venue = await self._get_owned_venue(provider, venue_id)
        try:
            await self._repository.delete(venue)
        except IntegrityError:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Venue has bookings and cannot be deleted")

    async def _get_owned_venue(self, provider: Provider, venue_id: int) -> Venue:
        venue = await self._repository.get_by_id(venue_id)
        if venue is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
        if venue.provider_id != provider.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your venue")
        return venue
