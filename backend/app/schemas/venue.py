from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class VenueCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str = ""
    capacity: int = Field(ge=1)
    city: str = Field(min_length=1, max_length=100)
    address: str = Field(min_length=1, max_length=255)
    price: Decimal = Field(ge=0)
    deposit_amount: Decimal = Field(ge=0)
    photos: list[str] = []


class VenueUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    capacity: int | None = Field(default=None, ge=1)
    city: str | None = Field(default=None, min_length=1, max_length=100)
    address: str | None = Field(default=None, min_length=1, max_length=255)
    price: Decimal | None = Field(default=None, ge=0)
    deposit_amount: Decimal | None = Field(default=None, ge=0)
    photos: list[str] | None = None


class VenueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    provider_id: int
    name: str
    description: str
    capacity: int
    city: str
    address: str
    price: Decimal
    deposit_amount: Decimal
    photos: list[str]
    created_at: datetime


class VenueListResponse(BaseModel):
    items: list[VenueResponse]
    total: int
