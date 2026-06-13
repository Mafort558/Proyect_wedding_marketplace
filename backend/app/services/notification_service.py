from fastapi import HTTPException, status

from app.models.entities import User
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationListResponse, NotificationResponse

NOTIFICATION_LIST_LIMIT = 30


class NotificationService:
    def __init__(self, notification_repository: NotificationRepository):
        self._notifications = notification_repository

    async def list_notifications(self, user: User) -> NotificationListResponse:
        items = await self._notifications.list_for_user(user.id, NOTIFICATION_LIST_LIMIT)
        unread_count = await self._notifications.count_unread(user.id)
        return NotificationListResponse(
            items=[NotificationResponse.model_validate(item) for item in items],
            unread_count=unread_count,
        )

    async def mark_read(self, user: User, notification_id: int) -> NotificationResponse:
        notification = await self._notifications.get_owned(notification_id, user.id)
        if notification is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        updated = await self._notifications.mark_read(notification)
        return NotificationResponse.model_validate(updated)

    async def mark_all_read(self, user: User) -> None:
        await self._notifications.mark_all_read(user.id)
