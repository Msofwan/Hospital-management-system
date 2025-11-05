import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..db.base import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    date_issued = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="Unpaid") # e.g., Unpaid, Paid, Overdue
    due_date = Column(DateTime, nullable=True)
    insurance_provider = Column(String, nullable=True)
    insurance_policy_number = Column(String, nullable=True)
    insurance_claim_number = Column(String, nullable=True)
    insurance_status = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="invoices")
