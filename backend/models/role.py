from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from sqlalchemy.orm import relationship
from ..db.base import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)

    permissions = relationship("RolePermission", back_populates="role")
    staff = relationship("Staff", back_populates="role")
    staff = relationship("Staff", back_populates="role")

