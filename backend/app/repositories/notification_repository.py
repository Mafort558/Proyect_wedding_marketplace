from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Notification


class NotificationRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, user_id: int, type: str, title: str, body: str, link: str) -> Notification:
        notification = Notification(user_id=user_id, type=type, title=title, body=body, link=link)
        self._session.add(notification)
        await self._session.commit()
        await self._session.refresh(notification)
        return notification

    async def list_for_user(self, user_id: int, limit: int) -> list[Notification]:
        query = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def count_unread(self, user_id: int) -> int:
        query = select(func.count()).select_from(Notification).where(
            Notification.user_id == user_id, Notification.read.is_(False)
        )
        return (await self._session.execute(query)).scalar_one()

    async def get_owned(self, notification_id: int, user_id: int) -> Notification | None:
        query = select(Notification).where(
            Notification.id == notification_id, Notification.user_id == user_id
        )
        return (await self._session.execute(query)).scalar_one_or_none()

    async def mark_read(self, notification: Notification) -> Notification:
        notification.read = True
        await self._session.commit()
        await self._session.refresh(notification)
        return notification

    async def mark_all_read(self, user_id: int) -> None:
        await self._session.execute(
            update(Notification)
            .where(Notification.user_id == user_id, Notification.read.is_(False))
            .values(read=True)
        )
        await self._session.commit()
