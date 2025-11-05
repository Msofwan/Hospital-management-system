from __future__ import annotations

import datetime
from typing import TYPE_CHECKING

from pydantic import BaseModel


# Base schema for invoice data
class InvoiceBase(BaseModel):
    patient_id: int
    amount: float
    description: str
    status: str = "Unpaid"
    due_date: datetime.datetime | None = None
    insurance_provider: str | None = None
    insurance_policy_number: str | None = None
    insurance_claim_number: str | None = None
    insurance_status: str | None = None

# Schema for creating a new invoice
class InvoiceCreate(InvoiceBase):
    pass

# Schema for updating an invoice (e.g., changing status)
class InvoiceUpdate(BaseModel):
    amount: float | None = None
    description: str | None = None
    status: str | None = None
    due_date: datetime.datetime | None = None
    insurance_provider: str | None = None
    insurance_policy_number: str | None = None
    insurance_claim_number: str | None = None
    insurance_status: str | None = None

# Schema for reading invoice data from the API
class Invoice(InvoiceBase):
    id: int
    date_issued: datetime.datetime
    patient: Patient

    class Config:
        from_attributes = True


class InvoiceSummary(BaseModel):
    id: int
    amount: float
    status: str
    date_issued: datetime.datetime
    due_date: datetime.datetime | None = None

    class Config:
        from_attributes = True


if TYPE_CHECKING:
    from .patient import Patient
