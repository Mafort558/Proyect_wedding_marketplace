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
REVIEWABLE_BOOKING_STATUSES = (BookingStatus.DEPOSIT_PAID, BookingStatus.CONFIRMED)

NOTIFICATION_BOOKING_RECEIVED = "booking_received"
NOTIFICATION_BOOKING_CONFIRMED = "booking_confirmed"
NOTIFICATION_BOOKING_REJECTED = "booking_rejected"
NOTIFICATION_BOOKINGS_LINK = "/bookings"
NOTIFICATION_PANEL_LINK = "/panel"
NOTIFICATION_MESSAGE_RECEIVED = "message_received"
NOTIFICATION_MESSAGE_LINK = "/messages"
