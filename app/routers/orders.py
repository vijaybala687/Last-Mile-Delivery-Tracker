import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from app.services.rate_engine import calculate_delivery_cost

router = APIRouter(
    prefix="/orders", 
    tags=["Orders"],
    dependencies=[Depends(get_current_user)]  # Requires login
)

@router.post("/", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order: schemas.OrderCreate, 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    dimensions = {
        "length": order.length,
        "width": order.width,
        "height": order.height
    }
    
    try:
        # 1. Calculate the dynamic delivery cost
        cost = calculate_delivery_cost(
            db=db,
            pickup_area_id=order.pickup_area_id,
            drop_area_id=order.drop_area_id,
            actual_weight=order.actual_weight,
            dimensions=dimensions,
            order_type=order.order_type
        )
        
        # Add COD Surcharge if applicable
        if order.is_cod:
            rate_card = db.query(models.RateCard).filter(models.RateCard.order_type == order.order_type).first()
            cost += rate_card.cod_surcharge

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    # 2. Save the order with a generated tracking number
    new_order = models.Order(
        tracking_number=f"TRK-{uuid.uuid4().hex[:8].upper()}",
        customer_id=current_user.id,
        pickup_area_id=order.pickup_area_id,
        drop_area_id=order.drop_area_id,
        order_type=order.order_type,
        status=models.StatusEnum.PENDING,
        delivery_cost=cost
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # 3. Log the initial tracking history
    history = models.TrackingHistory(
        order_id=new_order.id,
        status=models.StatusEnum.PENDING,
        location="System",
        remarks="Order created and rated successfully"
    )
    db.add(history)
    db.commit()
    
    return new_order