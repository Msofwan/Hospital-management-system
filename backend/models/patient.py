from sqlalchemy import Column, Integer, String, Date
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

    appointments = relationship("Appointment", back_populates="patient")
    bed = relationship("Bed", back_populates="patient", uselist=False)
    invoices = relationship("Invoice", back_populates="patient")
    dispensations = relationship("Dispensation", back_populates="patient")
