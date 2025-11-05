from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from pydantic import BaseModel


# Base schema for patient data
class PatientBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    contact_number: str
    email: str
    bpjs_number: str | None = None
    address: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_number: str | None = None
    insurance_provider: str | None = None
    insurance_policy_number: str | None = None

# Schema for creating a new patient
class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    date_of_birth: date | None = None
    contact_number: str | None = None
    email: str | None = None
    bpjs_number: str | None = None
    address: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_number: str | None = None
    insurance_provider: str | None = None
    insurance_policy_number: str | None = None

# Schema for reading patient data from the API
class Patient(PatientBase):
    id: int
    appointments: list[AppointmentSummary] = []
    visits: list[PatientVisitSummary] = []
    admissions: list[AdmissionSummary] = []
    invoices: list[InvoiceSummary] = []

    class Config:
        from_attributes = True


if TYPE_CHECKING:
    from .admission import AdmissionSummary
    from .appointment import AppointmentSummary
    from .invoice import InvoiceSummary
    from .patient_visit import PatientVisitSummary
