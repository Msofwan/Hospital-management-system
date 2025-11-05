from sqlalchemy import Column, Date, Integer, String
from sqlalchemy.orm import relationship

from ..db.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    date_of_birth = Column(Date)
    contact_number = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    bpjs_number = Column(String, unique=True, index=True, nullable=True)
    address = Column(String, nullable=True)
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_number = Column(String, nullable=True)
    insurance_provider = Column(String, nullable=True)
    insurance_policy_number = Column(String, nullable=True)

    appointments = relationship("Appointment", back_populates="patient")
    bed = relationship("Bed", back_populates="patient", uselist=False)
    invoices = relationship("Invoice", back_populates="patient")
    dispensations = relationship("Dispensation", back_populates="patient")
    visits = relationship("PatientVisit", back_populates="patient", cascade="all, delete-orphan")
    admissions = relationship("Admission", back_populates="patient", cascade="all, delete-orphan")
