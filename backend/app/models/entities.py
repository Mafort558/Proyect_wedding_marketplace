from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import BookingStatus, PaymentStatus, ProviderCategory, UserRole


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Provider(Base):
    __tablename__ = "providers"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    business_name: Mapped[str] = mapped_column(String(255))
    category: Mapped[ProviderCategory] = mapped_column(String(30), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    phone: Mapped[str] = mapped_column(String(50), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    venues: Mapped[list["Venue"]] = relationship(back_populates="provider")
    services: Mapped[list["Service"]] = relationship(back_populates="provider")


class Venue(Base):
    __tablename__ = "venues"

    id: Mapped[int] = mapped_column(primary_key=True)
    provider_id: Mapped[int] = mapped_column(ForeignKey("providers.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    capacity: Mapped[int] = mapped_column()
    city: Mapped[str] = mapped_column(String(100), index=True)
    address: Mapped[str] = mapped_column(String(255))
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    deposit_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    photos: Mapped[list[str]] = mapped_column(JSONB, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    provider: Mapped[Provider] = relationship(back_populates="venues")


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True)
    provider_id: Mapped[int] = mapped_column(ForeignKey("providers.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[ProviderCategory] = mapped_column(String(30), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    photos: Mapped[list[str]] = mapped_column(JSONB, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    provider: Mapped[Provider] = relationship(back_populates="services")


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    venue_id: Mapped[int | None] = mapped_column(ForeignKey("venues.id"), nullable=True, index=True)
    service_id: Mapped[int | None] = mapped_column(ForeignKey("services.id"), nullable=True, index=True)
    event_date: Mapped[date] = mapped_column(Date, index=True)
    status: Mapped[BookingStatus] = mapped_column(String(20), default=BookingStatus.PENDING, index=True)
    total_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id"), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    platform_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    status: Mapped[PaymentStatus] = mapped_column(String(20), default=PaymentStatus.PENDING, index=True)
    external_id: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
