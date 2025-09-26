from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models
from .database import engine, get_db
from .db.base import Base
from .models import appointment, bed, dispensation, invoice, medicine, patient, permission, role, role_permission, staff
from .routes import patients, appointments, beds, staff, auth, roles, invoices, medicines, dispensations
from .schemas.staff import StaffCreate
from .schemas.role import RoleCreate

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS Middleware
origins = [
    "http://localhost:3000", # Public frontend
    "http://localhost:3001", # Internal frontend (alternative port)
    "http://localhost:5173", # Internal frontend (Vite default)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include all the routers
app.include_router(auth.router)
app.include_router(roles.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(beds.router)
app.include_router(staff.router)
app.include_router(invoices.router)
app.include_router(medicines.router)
app.include_router(dispensations.router)

@app.get("/", tags=["Root"])
async def read_root():
    """A simple endpoint to check if the API is running."""
    return {"message": "Welcome to the Hospital Management System API"}
