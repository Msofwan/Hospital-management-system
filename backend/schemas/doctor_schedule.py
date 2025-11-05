from __future__ import annotations

from datetime import time
from typing import TYPE_CHECKING

from pydantic import BaseModel


class DoctorScheduleBase(BaseModel):
    staff_id: int
    day_of_week: str
    start_time: time
    end_time: time
    location: str | None = None
    notes: str | None = None


class DoctorScheduleCreate(DoctorScheduleBase):
    pass


class DoctorScheduleUpdate(BaseModel):
    day_of_week: str | None = None
    start_time: time | None = None
    end_time: time | None = None
    location: str | None = None
    notes: str | None = None


class DoctorSchedule(DoctorScheduleBase):
    id: int
    provider: StaffSummary

    class Config:
        from_attributes = True


if TYPE_CHECKING:
    from .staff import StaffSummary
