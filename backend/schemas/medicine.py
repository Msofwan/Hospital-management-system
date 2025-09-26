from pydantic import BaseModel

# Base schema for medicine data
class MedicineBase(BaseModel):
    name: str
    manufacturer: str
    stock_quantity: int
    unit_price: float

# Schema for creating a new medicine
class MedicineCreate(MedicineBase):
    pass

# Schema for updating a medicine
class MedicineUpdate(BaseModel):
    name: str | None = None
    manufacturer: str | None = None
    unit_price: float | None = None

# Schema for restocking a medicine
class MedicineRestock(BaseModel):
    quantity_added: int

# Schema for reading medicine data from the API
class Medicine(MedicineBase):
    id: int

    class Config:
        from_attributes = True
