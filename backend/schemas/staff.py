from pydantic import BaseModel
from .role import Role

# Base schema for staff data
class StaffBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    contact_number: str
    role_id: int

# Schema for creating a new staff member, requires a password
class StaffCreate(StaffBase):
    password: str

# Schema for reading staff data from the API (password excluded)
class Staff(StaffBase):
    id: int
    role: Role # Nested role object

    class Config:
        from_attributes = True
