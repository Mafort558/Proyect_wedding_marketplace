from pydantic import BaseModel, model_validator

from app.schemas.service import ServiceResponse
from app.schemas.venue import VenueResponse


class FavoriteToggleRequest(BaseModel):
    venue_id: int | None = None
    service_id: int | None = None

    @model_validator(mode="after")
    def validate_target(self) -> "FavoriteToggleRequest":
        if self.venue_id is None and self.service_id is None:
            raise ValueError("Either venue_id or service_id is required")
        if self.venue_id is not None and self.service_id is not None:
            raise ValueError("Provide only one of venue_id or service_id")
        return self


class FavoriteToggleResponse(BaseModel):
    favorited: bool


class FavoriteListResponse(BaseModel):
    venues: list[VenueResponse]
    services: list[ServiceResponse]


class FavoriteIdsResponse(BaseModel):
    venue_ids: list[int]
    service_ids: list[int]
