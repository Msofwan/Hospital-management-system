from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..db.base import Base


class AppointmentRequest(Base):
    __tablename__ = "appointment_requests"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    preferred_date = Column(Date, nullable=False)
    preferred_time = Column(String, nullable=True)
    reason = Column(Text, nullable=True)
    preferred_doctor_id = Column(Integer, ForeignKey("staff.id"), nullable=True)
    status = Column(String, nullable=False, default="Pending")
    decision_notes = Column(Text, nullable=True)
    handled_by_staff_id = Column(Integer, ForeignKey("staff.id"), nullable=True)
    converted_appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    preferred_doctor = relationship(
        "Staff",
        foreign_keys=[preferred_doctor_id],
        back_populates="appointment_requests",
    )
    handled_by_staff = relationship(
        "Staff",
        foreign_keys=[handled_by_staff_id],
        back_populates="handled_appointment_requests",
    )
    converted_appointment = relationship("Appointment", back_populates="source_request", uselist=False)
