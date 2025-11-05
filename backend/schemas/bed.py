from __future__ import annotations

from typing import TYPE_CHECKING

from pydantic import BaseModel


# Base schema for bed data
class BedBase(BaseModel):
    bed_number: str
    room_number: str
    is_occupied: bool = False
    patient_id: int | None = None

# Schema for creating a new bed
class BedCreate(BedBase):
    pass

# Schema for updating a bed
class BedUpdate(BaseModel):
    is_occupied: bool
    patient_id: int | None = None

# Schema for reading bed data from the API
class Bed(BedBase):
    id: int
    patient: Patient | None = None
    admissions: list[AdmissionSummary] = []

    class Config:
        from_attributes = True


if TYPE_CHECKING:
    from .admission import AdmissionSummary
    from .patient import Patient
