from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import ProviderCategory


class ProviderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    business_name: str
    category: ProviderCategory
    description: str
    phone: str
    created_at: datetime
