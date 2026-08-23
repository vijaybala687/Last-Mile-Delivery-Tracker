from app.database import Base
from fastapi import FastAPI
from app.database import engine, Base
from app import models
from app.routers import users, admin, orders, agents, tracking  # Updated imports
from fastapi.middleware.cors import CORSMiddleware


# This command tells SQLAlchemy to create all tables in the database if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Last-Mile Delivery API",
    description="API for managing deliveries, rate calculations, and agent assignments.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(admin.router)
app.include_router(orders.router)
app.include_router(agents.router)
app.include_router(tracking.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Last-Mile Delivery Tracker API"}