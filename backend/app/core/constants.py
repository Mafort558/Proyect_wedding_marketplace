from app.models.enums import BookingStatus, PaymentStatus

BLOCKING_BOOKING_STATUSES = (BookingStatus.DEPOSIT_PAID, BookingStatus.CONFIRMED)
MP_STATUS_MAP = {
    "approved": PaymentStatus.APPROVED,
    "rejected": PaymentStatus.REJECTED,
    "cancelled": PaymentStatus.REJECTED,
}
MP_WEBHOOK_PAYMENT_TYPES = ("payment",)
DECIMAL_CENTS = "0.01"
PROVIDER_ACTIONABLE_BOOKING_STATUSES = (BookingStatus.PENDING, BookingStatus.DEPOSIT_PAID)
DEFAULT_AVAILABILITY_WINDOW_DAYS = 365
