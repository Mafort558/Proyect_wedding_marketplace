from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, model_validator

from app.models.enums import BookingStatus


class BookingCreateRequest(BaseModel):
    venue_id: int | None = None
    service_id: int | None = None
    event_date: date

    @model_validator(mode="after")
    def validate_target(self) -> "BookingCreateRequest":
        if self.venue_id is None and self.service_id is None:
            raise ValueError("Either venue_id or service_id is required")
        if self.venue_id is not None and self.service_id is not None:
            raise ValueError("Provide only one of venue_id or service_id")
        return self


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    venue_id: int | None
    service_id: int | None
    event_date: date
    status: BookingStatus
    total_price: Decimal
    created_at: datetime


class VenueAvailabilityResponse(BaseModel):
    venue_id: int
    booked_dates: list[date]
