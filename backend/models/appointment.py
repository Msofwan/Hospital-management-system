from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..db.base import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    provider_id = Column(Integer, ForeignKey("staff.id"), nullable=True)
    doctor_name = Column(String, index=True, nullable=True)
    appointment_date = Column(DateTime)
    reason = Column(String)
    status = Column(String, default="Scheduled")
    location = Column(String, nullable=True)
    appointment_type = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="appointments")
    provider = relationship("Staff", back_populates="appointments")
    source_request = relationship("AppointmentRequest", back_populates="converted_appointment", uselist=False)
