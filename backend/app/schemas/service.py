from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ProviderCategory


class ServiceCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    category: ProviderCategory
    description: str = ""
    price: Decimal = Field(ge=0)
    photos: list[str] = []


class ServiceUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    category: ProviderCategory | None = None
    description: str | None = None
    price: Decimal | None = Field(default=None, ge=0)
    photos: list[str] | None = None


class ServiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    provider_id: int
    name: str
    category: ProviderCategory
    description: str
    price: Decimal
    photos: list[str]
    created_at: datetime


class ServiceListResponse(BaseModel):
    items: list[ServiceResponse]
    total: int
