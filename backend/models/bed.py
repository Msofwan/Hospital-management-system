from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from ..db.base import Base

class Bed(Base):
    __tablename__ = "beds"

    id = Column(Integer, primary_key=True, index=True)
    bed_number = Column(String, index=True)
    room_number = Column(String, index=True)
    is_occupied = Column(Boolean, default=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True, unique=True)

    patient = relationship("Patient", back_populates="bed")
