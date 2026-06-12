from enum import StrEnum


class UserRole(StrEnum):
    CLIENT = "client"
    PROVIDER = "provider"


class ProviderCategory(StrEnum):
    VENUE = "venue"
    CATERING = "catering"
    PHOTOGRAPHY = "photography"
    MUSIC = "music"
    DECORATION = "decoration"


class BookingStatus(StrEnum):
    PENDING = "pending"
    DEPOSIT_PAID = "deposit_paid"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class PaymentStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
