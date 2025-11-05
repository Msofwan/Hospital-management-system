from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING, Literal

from pydantic import BaseModel, EmailStr

from .appointment import AppointmentCreate

AppointmentRequestStatus = Literal["Pending", "In Review", "Approved", "Rejected", "Completed"]


class AppointmentRequestBase(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: str
    preferred_date: date
    preferred_time: str | None = None
    reason: str | None = None
    preferred_doctor_id: int | None = None


class AppointmentRequestCreate(AppointmentRequestBase):
    pass


class AppointmentRequest(AppointmentRequestBase):
    id: int
    status: AppointmentRequestStatus
    decision_notes: str | None = None
    handled_by_staff: StaffSummary | None = None
    converted_appointment_id: int | None = None
    created_at: datetime
    updated_at: datetime
    preferred_doctor: StaffSummary | None = None

    class Config:
        from_attributes = True


class AppointmentRequestUpdate(BaseModel):
    status: AppointmentRequestStatus | None = None
    decision_notes: str | None = None


class AppointmentRequestApprove(AppointmentCreate):
    decision_notes: str | None = None


class AppointmentRequestReceipt(BaseModel):
    id: int
    status: str
    message: str


if TYPE_CHECKING:
    from .staff import StaffSummary
