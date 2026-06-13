from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Review, User


class ReviewRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_for_target(self, venue_id: int | None, service_id: int | None) -> list[tuple[Review, str]]:
        query = select(Review, User.full_name).join(User, Review.user_id == User.id)
        if venue_id is not None:
            query = query.where(Review.venue_id == venue_id)
        if service_id is not None:
            query = query.where(Review.service_id == service_id)
        query = query.order_by(Review.created_at.desc())
        result = await self._session.execute(query)
        return [(row[0], row[1]) for row in result.all()]

    async def rating_summary_for_targets(
        self, venue_ids: list[int], service_ids: list[int]
    ) -> tuple[float | None, int]:
        if not venue_ids and not service_ids:
            return None, 0
        conditions = []
        if venue_ids:
            conditions.append(Review.venue_id.in_(venue_ids))
        if service_ids:
            conditions.append(Review.service_id.in_(service_ids))
        query = select(func.avg(Review.rating), func.count()).where(or_(*conditions))
        result = (await self._session.execute(query)).one()
        average = float(result[0]) if result[0] is not None else None
        return average, result[1]

    async def create(self, user_id: int, venue_id: int | None, service_id: int | None, rating: int, comment: str) -> Review:
        review = Review(user_id=user_id, venue_id=venue_id, service_id=service_id, rating=rating, comment=comment)
        self._session.add(review)
        await self._session.commit()
        await self._session.refresh(review)
        return review
