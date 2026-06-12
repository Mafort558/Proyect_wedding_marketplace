from decimal import Decimal
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    database_url: str
    cors_origins: str = "http://localhost:3000"
    api_title: str = "Wedding Marketplace API"
    api_version: str = "0.1.0"
    jwt_secret: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60 * 24
    backend_base_url: str = "http://localhost:8000"
    frontend_base_url: str = "http://localhost:3000"
    mp_access_token: str = ""
    mp_api_base_url: str = "https://api.mercadopago.com"
    mp_currency_id: str = "ARS"
    platform_fee_pct: Decimal = Field(default=Decimal("0.10"), ge=0, le=1)

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
