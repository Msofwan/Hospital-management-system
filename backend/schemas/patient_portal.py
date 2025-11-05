from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING

from pydantic import BaseModel, EmailStr


class PatientPortalLoginRequest(BaseModel):
    email: EmailStr
    date_of_birth: date


class PatientPortalLoginResponse(BaseModel):
    token: str
    expires_at: datetime


class PatientPortalPatient(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    contact_number: str


class PatientPortalProfile(BaseModel):
    patient: PatientPortalPatient
    upcoming_appointments: list[AppointmentSummary]
    recent_invoices: list[InvoiceSummary]

    class Config:
        from_attributes = True


if TYPE_CHECKING:
    from .appointment import AppointmentSummary
    from .invoice import InvoiceSummary
