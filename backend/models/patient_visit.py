from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..db.base import Base


class PatientVisit(Base):
    __tablename__ = "patient_visits"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    visit_date = Column(DateTime, nullable=False)
    chief_complaint = Column(String, nullable=True)
    diagnosis = Column(String, nullable=True)
    allergies = Column(String, nullable=True)
    treatment_plan = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="visits")
    provider = relationship("Staff", back_populates="visits")
    appointment = relationship("Appointment")
    prescriptions = relationship("Prescription", back_populates="visit", cascade="all, delete-orphan")
    lab_results = relationship("LabResult", back_populates="visit", cascade="all, delete-orphan")
