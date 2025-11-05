from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from pydantic import BaseModel


# Base schema for appointment data
class AppointmentBase(BaseModel):
    patient_id: int
    provider_id: int | None = None
    doctor_name: str | None = None
    appointment_date: datetime
    reason: str
    status: str = "Scheduled"
    location: str | None = None
    appointment_type: str | None = None

# Schema for creating a new appointment
class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    provider_id: int | None = None
    doctor_name: str | None = None
    appointment_date: datetime | None = None
    reason: str | None = None
    status: str | None = None
    location: str | None = None
    appointment_type: str | None = None

# Schema for reading appointment data from the API
class Appointment(AppointmentBase):
    id: int
    patient: Patient
    provider: StaffSummary | None = None

    class Config:
        from_attributes = True


class AppointmentSummary(BaseModel):
    id: int
    appointment_date: datetime
    reason: str
    status: str
    doctor_name: str | None = None

    class Config:
        from_attributes = True


if TYPE_CHECKING:
    from .patient import Patient
    from .staff import StaffSummary
