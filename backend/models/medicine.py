from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship

from ..db.base import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True)
    manufacturer = Column(String)
    stock_quantity = Column(Integer, default=0)
    unit_price = Column(Float)

    dispensations = relationship("Dispensation", back_populates="medicine")
