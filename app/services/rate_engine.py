import math
from sqlalchemy.orm import Session
from app import models

def calculate_volumetric_weight(length: float, width: float, height: float) -> float:
    """Calculates volumetric weight using the standard 5000 divisor."""
    return (length * width * height) / 5000.0

def calculate_delivery_cost(
    db: Session, 
    pickup_area_id: int, 
    drop_area_id: int, 
    actual_weight: float,
    dimensions: dict,
    order_type: models.OrderTypeEnum
) -> float:
    # 1. Determine the billable weight (higher of actual vs. volumetric)
    vol_weight = calculate_volumetric_weight(
        dimensions["length"], dimensions["width"], dimensions["height"]
    )
    billable_weight = max(actual_weight, vol_weight)
    
    # 2. Get pickup and drop areas to check zones
    pickup_area = db.query(models.Area).filter(models.Area.id == pickup_area_id).first()
    drop_area = db.query(models.Area).filter(models.Area.id == drop_area_id).first()
    
    if not pickup_area or not drop_area:
        raise ValueError("Invalid pickup or drop area ID")
        
    # 3. Determine if delivery is within the same zone or across zones
    is_intra_zone = (pickup_area.zone_id == drop_area.zone_id)
    
    # 4. Fetch the correct pricing tier for this order type (B2B or B2C)
    rate_card = db.query(models.RateCard).filter(models.RateCard.order_type == order_type).first()
    if not rate_card:
        raise ValueError(f"No rate card found for order type: {order_type}")
        
    # 5. Calculate base cost
    rate_per_kg = rate_card.intra_zone_rate if is_intra_zone else rate_card.inter_zone_rate
    
    # We round up the weight to the nearest 0.5kg for pricing (standard logistics practice)
    chargeable_units = math.ceil(billable_weight * 2) / 2
    
    return rate_per_kg * chargeable_units