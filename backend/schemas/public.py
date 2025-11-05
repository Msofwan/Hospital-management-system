from __future__ import annotations

from datetime import time

from pydantic import BaseModel, Field


class DoctorSchedulePublic(BaseModel):
    day_of_week: str
    start_time: time
    end_time: time
    location: str | None = None
    notes: str | None = None


class DoctorPublicProfile(BaseModel):
    id: int
    first_name: str
    last_name: str
    department: str | None = None
    specialization: str | None = None
    employment_type: str | None = None
    schedules: list[DoctorSchedulePublic] = Field(default_factory=list)
    next_available_slots: list[str] = Field(default_factory=list)

    class Config:
        from_attributes = True
