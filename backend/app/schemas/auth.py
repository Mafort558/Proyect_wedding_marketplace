from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

from app.models.enums import ProviderCategory, UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    role: UserRole = UserRole.CLIENT
    business_name: str | None = Field(default=None, min_length=1, max_length=255)
    category: ProviderCategory | None = None

    @model_validator(mode="after")
    def validate_provider_fields(self) -> "RegisterRequest":
        if self.role != UserRole.PROVIDER:
            return self
        if self.business_name is None or self.category is None:
            raise ValueError("business_name and category are required for provider registration")
        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    created_at: datetime
