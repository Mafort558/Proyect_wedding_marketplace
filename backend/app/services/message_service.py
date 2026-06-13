from fastapi import HTTPException, status

from app.core.constants import NOTIFICATION_MESSAGE_LINK, NOTIFICATION_MESSAGE_RECEIVED
from app.models.entities import Message, User
from app.repositories.message_repository import MessageRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.message import (
    ConversationListResponse,
    ConversationSummary,
    MessageCreateRequest,
    MessageResponse,
    ThreadResponse,
)


class MessageService:
    def __init__(
        self,
        message_repository: MessageRepository,
        user_repository: UserRepository,
        notification_repository: NotificationRepository,
    ):
        self._messages = message_repository
        self._users = user_repository
        self._notifications = notification_repository

    async def send_message(self, sender: User, request: MessageCreateRequest) -> MessageResponse:
        if request.recipient_id == sender.id:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No podés enviarte un mensaje")
        recipient = await self._users.get_by_id(request.recipient_id)
        if recipient is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient not found")
        message = await self._messages.create(sender.id, recipient.id, request.body)
        await self._notifications.create(
            user_id=recipient.id,
            type=NOTIFICATION_MESSAGE_RECEIVED,
            title="Nuevo mensaje",
            body=f"{sender.full_name} te escribió",
            link=f"{NOTIFICATION_MESSAGE_LINK}/{sender.id}",
        )
        return MessageResponse.model_validate(message)

    async def list_thread(self, user: User, partner_id: int) -> ThreadResponse:
        partner = await self._users.get_by_id(partner_id)
        if partner is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        messages = await self._messages.list_thread(user.id, partner_id)
        await self._messages.mark_thread_read(user.id, partner_id)
        return ThreadResponse(
            partner_id=partner.id,
            partner_name=partner.full_name,
            messages=[MessageResponse.model_validate(message) for message in messages],
        )

    async def list_conversations(self, user: User) -> ConversationListResponse:
        messages = await self._messages.list_for_user(user.id)
        latest: dict[int, Message] = {}
        unread: dict[int, int] = {}
        for message in messages:
            partner_id = message.recipient_id if message.sender_id == user.id else message.sender_id
            if partner_id not in latest:
                latest[partner_id] = message
            if message.recipient_id == user.id and not message.read:
                unread[partner_id] = unread.get(partner_id, 0) + 1
        items = [await self._build_summary(partner_id, message, unread) for partner_id, message in latest.items()]
        return ConversationListResponse(items=items)

    async def _build_summary(self, partner_id: int, message: Message, unread: dict[int, int]) -> ConversationSummary:
        partner = await self._users.get_by_id(partner_id)
        partner_name = partner.full_name if partner is not None else "Usuario"
        return ConversationSummary(
            partner_id=partner_id,
            partner_name=partner_name,
            last_body=message.body,
            last_at=message.created_at,
            unread_count=unread.get(partner_id, 0),
        )
