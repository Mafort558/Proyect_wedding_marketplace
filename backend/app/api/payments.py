from typing import Annotated

from fastapi import APIRouter, Depends, Request, status

from app.api.dependencies import CurrentUser, get_payment_service
from app.schemas.payment import CheckoutResponse, PaymentCreateRequest
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/checkout", response_model=CheckoutResponse, status_code=status.HTTP_201_CREATED)
async def create_checkout(
    request: PaymentCreateRequest,
    current_user: CurrentUser,
    service: Annotated[PaymentService, Depends(get_payment_service)],
) -> CheckoutResponse:
    return await service.create_checkout(current_user, request.booking_id)


@router.post("/webhook")
async def mercadopago_webhook(
    request: Request,
    service: Annotated[PaymentService, Depends(get_payment_service)],
) -> dict:
    notification_type = request.query_params.get("type") or request.query_params.get("topic")
    mp_payment_id = request.query_params.get("data.id") or request.query_params.get("id")
    if notification_type is None:
        body = await _safe_json(request)
        notification_type = body.get("type")
        mp_payment_id = str(body.get("data", {}).get("id", "")) or None
    await service.process_webhook(notification_type, mp_payment_id)
    return {"status": "ok"}


async def _safe_json(request: Request) -> dict:
    try:
        return await request.json()
    except ValueError:
        return {}
