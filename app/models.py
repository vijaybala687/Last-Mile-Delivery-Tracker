import enum
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Float, ForeignKey, Boolean, DateTime, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

# Enums for strictly typed statuses and roles
class RoleEnum(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    AGENT = "AGENT"
    ADMIN = "ADMIN"

class StatusEnum(str, enum.Enum):
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"

class OrderTypeEnum(str, enum.Enum):
    B2B = "B2B"
    B2C = "B2C"

# --- Models ---

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str]
    email: Mapped[str] = mapped_column(unique=True, index=True)
    role: Mapped[RoleEnum] = mapped_column(SQLEnum(RoleEnum), default=RoleEnum.CUSTOMER)

class Zone(Base):
    __tablename__ = "zones"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(unique=True)
    
    areas: Mapped[List["Area"]] = relationship(back_populates="zone")

class Area(Base):
    __tablename__ = "areas"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(unique=True)
    zone_id: Mapped[int] = mapped_column(ForeignKey("zones.id"))
    
    zone: Mapped["Zone"] = relationship(back_populates="areas")

class RateCard(Base):
    __tablename__ = "rate_cards"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_type: Mapped[OrderTypeEnum] = mapped_column(SQLEnum(OrderTypeEnum), unique=True)
    intra_zone_rate: Mapped[float]
    inter_zone_rate: Mapped[float]
    cod_surcharge: Mapped[float] = mapped_column(default=0.0)

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    agent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    
    pickup_address: Mapped[str]
    drop_address: Mapped[str]
    
    # Dimensions & Weight
    length: Mapped[float]
    breadth: Mapped[float]
    height: Mapped[float]
    actual_weight: Mapped[float]
    
    order_type: Mapped[OrderTypeEnum] = mapped_column(SQLEnum(OrderTypeEnum))
    is_cod: Mapped[bool] = mapped_column(default=False)
    calculated_charge: Mapped[float]
    
    status: Mapped[StatusEnum] = mapped_column(SQLEnum(StatusEnum), default=StatusEnum.PICKED_UP)
    
    tracking_history: Mapped[List["TrackingHistory"]] = relationship(back_populates="order")

class TrackingHistory(Base):
    __tablename__ = "tracking_history"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    status: Mapped[StatusEnum] = mapped_column(SQLEnum(StatusEnum))
    changed_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    
    order: Mapped["Order"] = relationship(back_populates="tracking_history")