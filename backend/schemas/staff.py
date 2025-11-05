from __future__ import annotations

from typing import TYPE_CHECKING

from pydantic import BaseModel

from .role import Role


# Base schema for staff data
class StaffBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    contact_number: str
    role_id: int
    department: str | None = None
    specialization: str | None = None
    license_number: str | None = None
    employment_type: str | None = None

# Schema for creating a new staff member, requires a password
class StaffCreate(StaffBase):
    password: str

class StaffUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    contact_number: str | None = None
    role_id: int | None = None
    department: str | None = None
    specialization: str | None = None
    license_number: str | None = None
    employment_type: str | None = None
    password: str | None = None

class StaffSummary(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: Role

    class Config:
        from_attributes = True

# Schema for reading staff data from the API (password excluded)
class Staff(StaffBase):
    id: int
    role: Role
    schedules: list[DoctorSchedule] = []

    class Config:
        from_attributes = True


if TYPE_CHECKING:
    from .doctor_schedule import DoctorSchedule
