from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from pydantic import BaseModel


class PatientVisitBase(BaseModel):
    patient_id: int
    provider_id: int
    appointment_id: int | None = None
    visit_date: datetime
    chief_complaint: str | None = None
    diagnosis: str | None = None
    allergies: str | None = None
    treatment_plan: str | None = None
    notes: str | None = None


class PatientVisitCreate(PatientVisitBase):
    pass


class PatientVisitUpdate(BaseModel):
    appointment_id: int | None = None
    visit_date: datetime | None = None
    chief_complaint: str | None = None
    diagnosis: str | None = None
    allergies: str | None = None
    treatment_plan: str | None = None
    notes: str | None = None


class PatientVisit(PatientVisitBase):
    id: int
    patient: Patient
    provider: StaffSummary
    prescriptions: list[Prescription] = []
    lab_results: list[LabResult] = []

    class Config:
        from_attributes = True


class PatientVisitSummary(BaseModel):
    id: int
    visit_date: datetime
    diagnosis: str | None = None

    class Config:
        from_attributes = True


if TYPE_CHECKING:
    from .lab_result import LabResult
    from .patient import Patient
    from .prescription import Prescription
    from .staff import StaffSummary
