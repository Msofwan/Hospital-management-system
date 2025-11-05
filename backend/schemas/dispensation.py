from __future__ import annotations

import datetime
from typing import TYPE_CHECKING

from pydantic import BaseModel


# Base schema for dispensation data
class DispensationBase(BaseModel):
    patient_id: int
    medicine_id: int
    quantity_dispensed: int
    prescription_id: int | None = None
    notes: str | None = None

# Schema for creating a new dispensation
class DispensationCreate(DispensationBase):
    pass

# Schema for reading dispensation data from the API
class Dispensation(DispensationBase):
    id: int
    staff_id: int
    date_dispensed: datetime.datetime
    staff: Staff
    patient: Patient
    medicine: Medicine
    prescription: Prescription | None = None

    class Config:
        from_attributes = True


if TYPE_CHECKING:
    from .medicine import Medicine
    from .patient import Patient
    from .prescription import Prescription
    from .staff import Staff
