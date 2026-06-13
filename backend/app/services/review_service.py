from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.core.constants import REVIEWABLE_BOOKING_STATUSES
from app.models.entities import User
from app.repositories.booking_repository import BookingRepository
from app.repositories.review_repository import ReviewRepository
from app.schemas.review import ReviewCreateRequest, ReviewListResponse, ReviewResponse


class ReviewService:
    def __init__(self, review_repository: ReviewRepository, booking_repository: BookingRepository):
        self._reviews = review_repository
        self._bookings = booking_repository

    async def list_reviews(self, venue_id: int | None, service_id: int | None) -> ReviewListResponse:
        rows = await self._reviews.list_for_target(venue_id, service_id)
        items = [self._to_response(review, author_name) for review, author_name in rows]
        average = round(sum(item.rating for item in items) / len(items), 2) if items else None
        return ReviewListResponse(items=items, total=len(items), average=average)

    async def create_review(self, user: User, request: ReviewCreateRequest) -> ReviewResponse:
        has_booking = await self._bookings.user_has_booking_for_target(
            user.id, request.venue_id, request.service_id, REVIEWABLE_BOOKING_STATUSES
        )
        if not has_booking:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo podés reseñar lo que reservaste",
            )
        try:
            review = await self._reviews.create(
                user.id, request.venue_id, request.service_id, request.rating, request.comment
            )
        except IntegrityError:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya dejaste una reseña")
        return self._to_response(review, user.full_name)

    def _to_response(self, review, author_name: str) -> ReviewResponse:
        return ReviewResponse(
            id=review.id,
            user_id=review.user_id,
            author_name=author_name,
            venue_id=review.venue_id,
            service_id=review.service_id,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at,
        )
