from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.enums import PaymentStatus


class PaymentCreateRequest(BaseModel):
    booking_id: int


class CheckoutResponse(BaseModel):
    payment_id: int
    booking_id: int
    preference_id: str
    init_point: str


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    amount: Decimal
    platform_fee: Decimal
    status: PaymentStatus
    external_id: str
    created_at: datetime
