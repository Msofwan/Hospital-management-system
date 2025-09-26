from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime

from ..db.base import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    date_issued = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="Unpaid") # e.g., Unpaid, Paid, Overdue

    patient = relationship("Patient", back_populates="invoices")
