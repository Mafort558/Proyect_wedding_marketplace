from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import BookingStatus, ProviderCategory
from app.schemas.package import PackageResponse
from app.schemas.service import ServiceResponse
from app.schemas.venue import VenueResponse


class ProviderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    business_name: str
    category: ProviderCategory
    description: str
    phone: str
    created_at: datetime


class ProviderPublicResponse(BaseModel):
    id: int
    user_id: int
    business_name: str
    category: ProviderCategory
    description: str
    phone: str
    created_at: datetime
    rating: float | None
    review_count: int
    venues: list[VenueResponse]
    services: list[ServiceResponse]
    packages: list[PackageResponse]


class ProviderUpdateRequest(BaseModel):
    business_name: str = Field(min_length=1, max_length=255)
    description: str = Field(default="", max_length=5000)
    phone: str = Field(default="", max_length=50)


class ProviderDashboardResponse(BaseModel):
    total_venues: int
    total_services: int
    total_bookings: int
    bookings_by_status: dict[BookingStatus, int]
    confirmed_revenue: Decimal
    upcoming_events: int
    rating: float | None
    review_count: int
