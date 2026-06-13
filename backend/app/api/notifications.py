from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.dependencies import CurrentUser, get_notification_service
from app.schemas.notification import NotificationListResponse, NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    user: CurrentUser,
    service: Annotated[NotificationService, Depends(get_notification_service)],
) -> NotificationListResponse:
    return await service.list_notifications(user)


@router.post("/{notification_id}/read", response_model=NotificationResponse)
async def mark_read(
    notification_id: int,
    user: CurrentUser,
    service: Annotated[NotificationService, Depends(get_notification_service)],
) -> NotificationResponse:
    return await service.mark_read(user, notification_id)


@router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_read(
    user: CurrentUser,
    service: Annotated[NotificationService, Depends(get_notification_service)],
) -> None:
    await service.mark_all_read(user)
