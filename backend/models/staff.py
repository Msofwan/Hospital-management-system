from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..db.base import Base


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    contact_number = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    department = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    license_number = Column(String, unique=True, nullable=True)
    employment_type = Column(String, nullable=True)

    role_id = Column(Integer, ForeignKey("roles.id"))
    role = relationship("Role", back_populates="staff")
    dispensations = relationship("Dispensation", back_populates="staff")
    appointments = relationship("Appointment", back_populates="provider")
    schedules = relationship("DoctorSchedule", back_populates="provider", cascade="all, delete-orphan")
    visits = relationship("PatientVisit", back_populates="provider")
    admissions = relationship("Admission", back_populates="attending_provider")
    appointment_requests = relationship(
        "AppointmentRequest",
        back_populates="preferred_doctor",
        foreign_keys="AppointmentRequest.preferred_doctor_id",
    )
    handled_appointment_requests = relationship(
        "AppointmentRequest",
        back_populates="handled_by_staff",
        foreign_keys="AppointmentRequest.handled_by_staff_id",
    )
    appointment_requests = relationship("AppointmentRequest", back_populates="preferred_doctor")
