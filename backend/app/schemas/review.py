from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ReviewCreateRequest(BaseModel):
    venue_id: int | None = None
    service_id: int | None = None
    rating: int = Field(ge=1, le=5)
    comment: str = Field(default="", max_length=2000)

    @model_validator(mode="after")
    def validate_target(self) -> "ReviewCreateRequest":
        if self.venue_id is None and self.service_id is None:
            raise ValueError("Either venue_id or service_id is required")
        if self.venue_id is not None and self.service_id is not None:
            raise ValueError("Provide only one of venue_id or service_id")
        return self


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    author_name: str
    venue_id: int | None
    service_id: int | None
    rating: int
    comment: str
    created_at: datetime


class ReviewListResponse(BaseModel):
    items: list[ReviewResponse]
    total: int
    average: float | None
