from pydantic import BaseModel
from datetime import datetime

from .patient import Patient

# Base schema for appointment data
class AppointmentBase(BaseModel):
    patient_id: int
    doctor_name: str
    appointment_date: datetime
    reason: str
    status: str = "Scheduled"

# Schema for creating a new appointment
class AppointmentCreate(AppointmentBase):
    pass

# Schema for reading appointment data from the API
class Appointment(AppointmentBase):
    id: int
    patient: Patient

    class Config:
        from_attributes = True
