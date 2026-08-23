from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(prefix="/track", tags=["Public Tracking"])

@router.get("/{tracking_number}")
def track_package(tracking_number: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.tracking_number == tracking_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Tracking number not found")
        
    # Get all history logs for this order
    history = db.query(models.TrackingHistory).filter(models.TrackingHistory.order_id == order.id).all()
    
    return {
        "tracking_number": order.tracking_number,
        "current_status": order.status,
        "history": [{"status": h.status, "location": h.location, "remarks": h.remarks} for h in history]
    }