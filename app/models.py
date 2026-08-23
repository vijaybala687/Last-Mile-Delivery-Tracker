import enum
from sqlalchemy import ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

# --- ENUMS ---
class RoleEnum(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    AGENT = "AGENT"
    ADMIN = "ADMIN"

class StatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class OrderTypeEnum(str, enum.Enum):
    B2B = "B2B"
    B2C = "B2C"

# --- MODELS ---
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str]
    email: Mapped[str] = mapped_column(unique=True, index=True)
    hashed_password: Mapped[str]
    role: Mapped[RoleEnum] = mapped_column(SQLEnum(RoleEnum), default=RoleEnum.CUSTOMER)

class Zone(Base):
    __tablename__ = "zones"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(unique=True, index=True)
    areas = relationship("Area", back_populates="zone")

class Area(Base):
    __tablename__ = "areas"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(unique=True)
    zone_id: Mapped[int] = mapped_column(ForeignKey("zones.id"))
    zone = relationship("Zone", back_populates="areas")

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
    tracking_number: Mapped[str] = mapped_column(unique=True, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    pickup_area_id: Mapped[int] = mapped_column(ForeignKey("areas.id"))
    drop_area_id: Mapped[int] = mapped_column(ForeignKey("areas.id"))
    order_type: Mapped[OrderTypeEnum] = mapped_column(SQLEnum(OrderTypeEnum))
    status: Mapped[StatusEnum] = mapped_column(SQLEnum(StatusEnum), default=StatusEnum.PENDING)
    delivery_cost: Mapped[float]

class TrackingHistory(Base):
    __tablename__ = "tracking_history"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    status: Mapped[StatusEnum] = mapped_column(SQLEnum(StatusEnum))
    location: Mapped[str]
    remarks: Mapped[str] = mapped_column(nullable=True)