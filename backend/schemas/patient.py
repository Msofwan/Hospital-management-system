from pydantic import BaseModel
from datetime import date

# Base schema for patient data
class PatientBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    contact_number: str
    email: str

# Schema for creating a new patient
class PatientCreate(PatientBase):
    pass

# Schema for reading patient data from the API
class Patient(PatientBase):
    id: int

    class Config:
        from_attributes = True
