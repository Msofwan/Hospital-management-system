from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..db.base import Base


class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(Integer, primary_key=True, index=True)
    visit_id = Column(Integer, ForeignKey("patient_visits.id"), nullable=False)
    test_name = Column(String, nullable=False)
    result_value = Column(String, nullable=True)
    unit = Column(String, nullable=True)
    normal_range = Column(String, nullable=True)
    result_date = Column(DateTime, nullable=False)
    notes = Column(String, nullable=True)

    visit = relationship("PatientVisit", back_populates="lab_results")
