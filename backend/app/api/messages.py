from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.dependencies import CurrentUser, get_message_service
from app.schemas.message import (
    ConversationListResponse,
    MessageCreateRequest,
    MessageResponse,
    ThreadResponse,
)
from app.services.message_service import MessageService

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    user: CurrentUser,
    service: Annotated[MessageService, Depends(get_message_service)],
) -> ConversationListResponse:
    return await service.list_conversations(user)


@router.get("/{partner_id}", response_model=ThreadResponse)
async def get_thread(
    partner_id: int,
    user: CurrentUser,
    service: Annotated[MessageService, Depends(get_message_service)],
) -> ThreadResponse:
    return await service.list_thread(user, partner_id)


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    request: MessageCreateRequest,
    user: CurrentUser,
    service: Annotated[MessageService, Depends(get_message_service)],
) -> MessageResponse:
    return await service.send_message(user, request)
