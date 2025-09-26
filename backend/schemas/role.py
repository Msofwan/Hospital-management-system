from pydantic import BaseModel

# Base schema for role data
class RoleBase(BaseModel):
    name: str
    description: str | None = None

# Schema for creating a new role
class RoleCreate(RoleBase):
    pass

# Schema for reading role data from the API
class Role(RoleBase):
    id: int

    class Config:
        from_attributes = True
