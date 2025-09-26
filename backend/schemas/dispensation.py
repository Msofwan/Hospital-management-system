from pydantic import BaseModel
import datetime

from .staff import Staff
from .patient import Patient
from .medicine import Medicine

# Base schema for dispensation data
class DispensationBase(BaseModel):
    patient_id: int
    medicine_id: int
    quantity_dispensed: int
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

    class Config:
        from_attributes = True
