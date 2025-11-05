from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from pydantic import BaseModel


class AdmissionBase(BaseModel):
    patient_id: int
    bed_id: int | None = None
    attending_staff_id: int | None = None
    reason: str | None = None
    status: str = "Admitted"
    admitted_at: datetime
    discharged_at: datetime | None = None
    discharge_summary: str | None = None


class AdmissionCreate(AdmissionBase):
    pass


class AdmissionUpdate(BaseModel):
    bed_id: int | None = None
    attending_staff_id: int | None = None
    reason: str | None = None
    status: str | None = None
    admitted_at: datetime | None = None
    discharged_at: datetime | None = None
    discharge_summary: str | None = None


class Admission(AdmissionBase):
    id: int
    patient: Patient
    bed: Bed | None = None
    attending_provider: StaffSummary | None = None

    class Config:
        from_attributes = True


class AdmissionSummary(BaseModel):
    id: int
    admitted_at: datetime
    discharged_at: datetime | None = None
    status: str

    class Config:
        from_attributes = True


if TYPE_CHECKING:
    from .bed import Bed
    from .patient import Patient
    from .staff import StaffSummary
