from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
import datetime

from ..db.base import Base

class Dispensation(Base):
    __tablename__ = "dispensations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)
    quantity_dispensed = Column(Integer, nullable=False)
    date_dispensed = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="dispensations")
    medicine = relationship("Medicine", back_populates="dispensations")
    staff = relationship("Staff", back_populates="dispensations")
