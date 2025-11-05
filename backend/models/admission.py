from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..db.base import Base


class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    bed_id = Column(Integer, ForeignKey("beds.id"), nullable=True)
    attending_staff_id = Column(Integer, ForeignKey("staff.id"), nullable=True)
    reason = Column(String, nullable=True)
    status = Column(String, default="Admitted")
    admitted_at = Column(DateTime, nullable=False)
    discharged_at = Column(DateTime, nullable=True)
    discharge_summary = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="admissions")
    bed = relationship("Bed", back_populates="admissions")
    attending_provider = relationship("Staff", back_populates="admissions")
