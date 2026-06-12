from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Payment


class PaymentRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, booking_id: int, amount: Decimal, platform_fee: Decimal) -> Payment:
        payment = Payment(booking_id=booking_id, amount=amount, platform_fee=platform_fee)
        self._session.add(payment)
        await self._session.commit()
        await self._session.refresh(payment)
        return payment

    async def get_by_id(self, payment_id: int) -> Payment | None:
        result = await self._session.execute(select(Payment).where(Payment.id == payment_id))
        return result.scalar_one_or_none()

    async def update(self, payment: Payment, status: str, external_id: str) -> Payment:
        payment.status = status
        payment.external_id = external_id
        await self._session.commit()
        await self._session.refresh(payment)
        return payment
