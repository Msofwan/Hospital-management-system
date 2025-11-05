from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from pydantic import BaseModel


class LabResultBase(BaseModel):
    visit_id: int
    test_name: str
    result_value: str | None = None
    unit: str | None = None
    normal_range: str | None = None
    result_date: datetime
    notes: str | None = None


class LabResultCreate(LabResultBase):
    pass


class LabResultUpdate(BaseModel):
    test_name: str | None = None
    result_value: str | None = None
    unit: str | None = None
    normal_range: str | None = None
    result_date: datetime | None = None
    notes: str | None = None


class LabResult(LabResultBase):
    id: int
    visit: PatientVisitSummary

    class Config:
        from_attributes = True


if TYPE_CHECKING:
    from .patient_visit import PatientVisitSummary
