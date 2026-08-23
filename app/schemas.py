from pydantic import BaseModel
from typing import List, Optional
from app.models import RoleEnum, StatusEnum, OrderTypeEnum

# --- User Schemas ---
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: RoleEnum = RoleEnum.CUSTOMER

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum

    class Config:
        from_attributes = True

# --- Zone & Area Schemas ---
class AreaCreate(BaseModel):
    name: str

class ZoneCreate(BaseModel):
    name: str
    areas: List[AreaCreate] = []

class ZoneResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

# --- Rate Card Schemas ---
class RateCardCreate(BaseModel):
    order_type: OrderTypeEnum
    intra_zone_rate: float
    inter_zone_rate: float
    cod_surcharge: float = 0.0