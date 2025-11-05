from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import crud, models, schemas  # noqa: F401 - ensure schemas forward refs are resolved
from .database import engine
from .db.base import Base
from .models import staff as models_staff  # noqa: F401  # ensure model registration
from .routes import (
    admissions,
    appointment_requests,
    appointments,
    auth,
    beds,
    dispensations,
    doctor_schedules,
    invoices,
    lab_results,
    medicines,
    patient_portal,
    patient_visits,
    patients,
    prescriptions,
    public,
    roles,
    staff,
)

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
app.include_router(doctor_schedules.router)
app.include_router(patient_visits.router)
app.include_router(prescriptions.router)
app.include_router(lab_results.router)
app.include_router(admissions.router)
app.include_router(appointment_requests.router)
app.include_router(public.router)
app.include_router(patient_portal.router)

@app.get("/", tags=["Root"])
async def read_root():
    """A simple endpoint to check if the API is running."""
    return {"message": "Welcome to the Hospital Management System API"}
