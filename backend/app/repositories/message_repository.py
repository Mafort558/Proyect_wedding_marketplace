from sqlalchemy import or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Message


class MessageRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, sender_id: int, recipient_id: int, body: str) -> Message:
        message = Message(sender_id=sender_id, recipient_id=recipient_id, body=body)
        self._session.add(message)
        await self._session.commit()
        await self._session.refresh(message)
        return message

    async def list_thread(self, user_id: int, partner_id: int) -> list[Message]:
        query = (
            select(Message)
            .where(
                or_(
                    (Message.sender_id == user_id) & (Message.recipient_id == partner_id),
                    (Message.sender_id == partner_id) & (Message.recipient_id == user_id),
                )
            )
            .order_by(Message.created_at)
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def list_for_user(self, user_id: int) -> list[Message]:
        query = (
            select(Message)
            .where(or_(Message.sender_id == user_id, Message.recipient_id == user_id))
            .order_by(Message.created_at.desc())
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def mark_thread_read(self, user_id: int, partner_id: int) -> None:
        await self._session.execute(
            update(Message)
            .where(
                Message.recipient_id == user_id,
                Message.sender_id == partner_id,
                Message.read.is_(False),
            )
            .values(read=True)
        )
        await self._session.commit()
