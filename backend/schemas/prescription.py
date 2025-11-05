from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from pydantic import BaseModel


class PrescriptionBase(BaseModel):
    visit_id: int
    medicine_name: str
    dosage: str | None = None
    frequency: str | None = None
    duration: str | None = None
    instructions: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class PrescriptionCreate(PrescriptionBase):
    pass


class PrescriptionUpdate(BaseModel):
    medicine_name: str | None = None
    dosage: str | None = None
    frequency: str | None = None
    duration: str | None = None
    instructions: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class Prescription(PrescriptionBase):
    id: int
    visit: PatientVisitSummary

    class Config:
        from_attributes = True


if TYPE_CHECKING:
    from .patient_visit import PatientVisitSummary
