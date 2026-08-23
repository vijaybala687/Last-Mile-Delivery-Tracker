from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.dependencies import get_current_agent

router = APIRouter(
    prefix="/agents", 
    tags=["Agent Operations"],
    dependencies=[Depends(get_current_agent)]
)

@router.put("/orders/{tracking_number}/status")
def update_order_status(
    tracking_number: str, 
    new_status: models.StatusEnum, 
    location: str, 
    db: Session = Depends(get_db)
):
    # Find the order
    order = db.query(models.Order).filter(models.Order.tracking_number == tracking_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update order status
    order.status = new_status
    
    # Log it in the tracking history
    history = models.TrackingHistory(
        order_id=order.id,
        status=new_status,
        location=location,
        remarks=f"Status updated to {new_status} at {location}"
    )
    
    db.add(history)
    db.commit()
    return {"message": "Status updated successfully", "current_status": order.status}