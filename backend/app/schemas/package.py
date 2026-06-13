from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PackageCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str = ""
    price: Decimal = Field(ge=0)
    service_ids: list[int] = Field(min_length=1)


class PackageUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    price: Decimal | None = Field(default=None, ge=0)
    service_ids: list[int] | None = Field(default=None, min_length=1)


class PackageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    provider_id: int
    name: str
    description: str
    price: Decimal
    service_ids: list[int]
    created_at: datetime


class PackageListResponse(BaseModel):
    items: list[PackageResponse]
    total: int
