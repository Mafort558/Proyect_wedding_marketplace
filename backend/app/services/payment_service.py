from decimal import Decimal

import httpx
from fastapi import HTTPException, status

from app.core.config import Settings
from app.core.constants import DECIMAL_CENTS, MP_STATUS_MAP, MP_WEBHOOK_PAYMENT_TYPES
from app.integrations.mercadopago_client import MercadoPagoClient
from app.models.entities import Booking, Payment, User
from app.models.enums import BookingStatus, PaymentStatus
from app.repositories.booking_repository import BookingRepository
from app.repositories.payment_repository import PaymentRepository
from app.repositories.venue_repository import VenueRepository
from app.schemas.payment import CheckoutResponse


class PaymentService:
    def __init__(
        self,
        payment_repository: PaymentRepository,
        booking_repository: BookingRepository,
        venue_repository: VenueRepository,
        mp_client: MercadoPagoClient,
        settings: Settings,
    ):
        self._payment_repository = payment_repository
        self._booking_repository = booking_repository
        self._venue_repository = venue_repository
        self._mp_client = mp_client
        self._settings = settings

    async def create_checkout(self, current_user: User, booking_id: int) -> CheckoutResponse:
        if not self._mp_client.is_configured:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Payments are not configured")
        booking = await self._get_payable_booking(current_user, booking_id)
        amount = await self._deposit_amount(booking)
        platform_fee = (amount * self._settings.platform_fee_pct).quantize(Decimal(DECIMAL_CENTS))
        payment = await self._payment_repository.create(booking.id, amount, platform_fee)
        preference = await self._create_preference(payment, amount)
        updated = await self._payment_repository.update(payment, PaymentStatus.PENDING, preference["id"])
        return CheckoutResponse(
            payment_id=updated.id,
            booking_id=booking.id,
            preference_id=preference["id"],
            init_point=preference["init_point"],
        )

    async def process_webhook(self, notification_type: str | None, mp_payment_id: str | None) -> None:
        if notification_type not in MP_WEBHOOK_PAYMENT_TYPES:
            return
        if mp_payment_id is None:
            return
        mp_payment = await self._fetch_mp_payment(mp_payment_id)
        mapped_status = MP_STATUS_MAP.get(mp_payment.get("status"))
        if mapped_status is None:
            return
        payment = await self._payment_repository.get_by_id(int(mp_payment.get("external_reference", 0)))
        if payment is None:
            return
        if payment.status == PaymentStatus.APPROVED:
            return
        await self._payment_repository.update(payment, mapped_status, str(mp_payment_id))
        if mapped_status != PaymentStatus.APPROVED:
            return
        await self._mark_deposit_paid(payment)

    async def _mark_deposit_paid(self, payment: Payment) -> None:
        booking = await self._booking_repository.get_by_id(payment.booking_id)
        if booking is None:
            return
        if booking.status != BookingStatus.PENDING:
            return
        await self._booking_repository.update_status(booking, BookingStatus.DEPOSIT_PAID)

    async def _create_preference(self, payment: Payment, amount: Decimal) -> dict:
        payload = {
            "items": [
                {
                    "title": f"Booking #{payment.booking_id} deposit",
                    "quantity": 1,
                    "unit_price": float(amount),
                    "currency_id": self._settings.mp_currency_id,
                }
            ],
            "external_reference": str(payment.id),
            "notification_url": f"{self._settings.backend_base_url}/api/payments/webhook",
            "back_urls": {
                "success": f"{self._settings.frontend_base_url}/checkout/success",
                "pending": f"{self._settings.frontend_base_url}/checkout/pending",
                "failure": f"{self._settings.frontend_base_url}/checkout/failure",
            },
            "auto_return": "approved",
        }
        try:
            return await self._mp_client.create_preference(payload)
        except httpx.HTTPError:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Payment provider error")

    async def _fetch_mp_payment(self, mp_payment_id: str) -> dict:
        try:
            return await self._mp_client.get_payment(mp_payment_id)
        except httpx.HTTPError:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Payment provider error")

    async def _get_payable_booking(self, current_user: User, booking_id: int) -> Booking:
        booking = await self._booking_repository.get_by_id(booking_id)
        if booking is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        if booking.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your booking")
        if booking.status != BookingStatus.PENDING:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Booking is already {booking.status}")
        return booking

    async def _deposit_amount(self, booking: Booking) -> Decimal:
        if booking.venue_id is None:
            return booking.total_price
        venue = await self._venue_repository.get_by_id(booking.venue_id)
        if venue is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
        return venue.deposit_amount
