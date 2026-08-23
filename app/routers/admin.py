from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_admin

# Notice we inject get_current_admin as a dependency for the ENTIRE router.
# This guarantees that no Customer or Agent can access these endpoints.
router = APIRouter(
    prefix="/admin", 
    tags=["Admin Configuration"],
    dependencies=[Depends(get_current_admin)]
)

@router.post("/zones", response_model=schemas.ZoneResponse, status_code=status.HTTP_201_CREATED)
def create_zone(zone: schemas.ZoneCreate, db: Session = Depends(get_db)):
    # Check if zone name already exists to prevent duplicates
    existing_zone = db.query(models.Zone).filter(models.Zone.name == zone.name).first()
    if existing_zone:
        raise HTTPException(status_code=400, detail="Zone already exists")
    
    new_zone = models.Zone(name=zone.name)
    db.add(new_zone)
    db.commit()
    db.refresh(new_zone)
    
    # Add associated areas if provided in the payload
    for area_data in zone.areas:
        new_area = models.Area(name=area_data.name, zone_id=new_zone.id)
        db.add(new_area)
    
    db.commit()
    return new_zone

@router.post("/rate-cards", status_code=status.HTTP_201_CREATED)
def create_rate_card(rate_card: schemas.RateCardCreate, db: Session = Depends(get_db)):
    # Check if a rate card for this specific order type (e.g., B2B) already exists
    existing_card = db.query(models.RateCard).filter(models.RateCard.order_type == rate_card.order_type).first()
    if existing_card:
        raise HTTPException(status_code=400, detail=f"Rate card for {rate_card.order_type} already exists. Update it instead.")
    
    new_rate_card = models.RateCard(
        order_type=rate_card.order_type,
        intra_zone_rate=rate_card.intra_zone_rate,
        inter_zone_rate=rate_card.inter_zone_rate,
        cod_surcharge=rate_card.cod_surcharge
    )
    
    db.add(new_rate_card)
    db.commit()
    db.refresh(new_rate_card)
    return new_rate_card