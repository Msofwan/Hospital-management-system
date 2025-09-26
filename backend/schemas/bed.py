from pydantic import BaseModel
from typing import Optional

from .patient import Patient

# Base schema for bed data
class BedBase(BaseModel):
    bed_number: str
    room_number: str
    is_occupied: bool = False
    patient_id: Optional[int] = None

# Schema for creating a new bed
class BedCreate(BedBase):
    pass

# Schema for updating a bed
class BedUpdate(BaseModel):
    is_occupied: bool
    patient_id: Optional[int] = None

# Schema for reading bed data from the API
class Bed(BedBase):
    id: int
    patient: Optional[Patient] = None

    class Config:
        from_attributes = True
