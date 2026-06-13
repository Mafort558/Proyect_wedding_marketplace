from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import CurrentUser, get_review_service
from app.schemas.review import ReviewCreateRequest, ReviewListResponse, ReviewResponse
from app.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("", response_model=ReviewListResponse)
async def list_reviews(
    service: Annotated[ReviewService, Depends(get_review_service)],
    venue_id: int | None = None,
    service_id: int | None = None,
) -> ReviewListResponse:
    if (venue_id is None) == (service_id is None):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Provide exactly one of venue_id or service_id")
    return await service.list_reviews(venue_id, service_id)


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    request: ReviewCreateRequest,
    current_user: CurrentUser,
    service: Annotated[ReviewService, Depends(get_review_service)],
) -> ReviewResponse:
    return await service.create_review(current_user, request)
