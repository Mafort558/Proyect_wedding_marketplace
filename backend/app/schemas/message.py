from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MessageCreateRequest(BaseModel):
    recipient_id: int
    body: str = Field(min_length=1, max_length=2000)


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    recipient_id: int
    body: str
    read: bool
    created_at: datetime


class ConversationSummary(BaseModel):
    partner_id: int
    partner_name: str
    last_body: str
    last_at: datetime
    unread_count: int


class ConversationListResponse(BaseModel):
    items: list[ConversationSummary]


class ThreadResponse(BaseModel):
    partner_id: int
    partner_name: str
    messages: list[MessageResponse]
