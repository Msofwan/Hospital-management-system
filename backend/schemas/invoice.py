from pydantic import BaseModel
import datetime
from .patient import Patient # Import Patient schema for nesting

# Base schema for invoice data
class InvoiceBase(BaseModel):
    patient_id: int
    amount: float
    description: str
    status: str = "Unpaid"

# Schema for creating a new invoice
class InvoiceCreate(InvoiceBase):
    pass

# Schema for updating an invoice (e.g., changing status)
class InvoiceUpdate(BaseModel):
    status: str

# Schema for reading invoice data from the API
class Invoice(InvoiceBase):
    id: int
    date_issued: datetime.datetime
    patient: Patient # Include full patient details

    class Config:
        from_attributes = True
