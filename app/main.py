from fastapi import FastAPI
from app.database import engine, Base
from app import models

# This command tells SQLAlchemy to create all tables in the database if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Last-Mile Delivery API",
    description="API for managing deliveries, rate calculations, and agent assignments.",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Last-Mile Delivery Tracker API"}