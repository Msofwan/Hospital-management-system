from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models
from ..database import get_db
from ..schemas.medicine import Medicine, MedicineCreate, MedicineUpdate, MedicineRestock
from ..auth import get_current_user

router = APIRouter(
    prefix="/medicines",
    tags=["Medicines"],
    dependencies=[Depends(get_current_user)]
)

# Dependency for role checks
def require_role(allowed_roles: List[str]):
    def role_checker(current_user: models.staff.Staff = Depends(get_current_user)):
        if current_user.role.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="The user does not have privileges to perform this action."
            )
    return role_checker

@router.get("/", response_model=List[Medicine])
def get_all_medicines(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_medicines(db, skip=skip, limit=limit)

@router.post("/", response_model=Medicine, dependencies=[Depends(require_role(["Admin", "Pharmacist"]))])
def create_new_medicine(medicine: MedicineCreate, db: Session = Depends(get_db)):
    return crud.create_medicine(db=db, medicine=medicine)

@router.put("/{medicine_id}", response_model=Medicine, dependencies=[Depends(require_role(["Admin", "Pharmacist"]))])
def update_existing_medicine(medicine_id: int, medicine: MedicineUpdate, db: Session = Depends(get_db)):
    db_medicine = crud.update_medicine(db, medicine_id=medicine_id, medicine=medicine)
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return db_medicine

@router.post("/{medicine_id}/restock", response_model=Medicine, dependencies=[Depends(require_role(["Admin", "Pharmacist"]))])
def restock_existing_medicine(medicine_id: int, restock: MedicineRestock, db: Session = Depends(get_db)):
    db_medicine = crud.restock_medicine(db, medicine_id=medicine_id, restock=restock)
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return db_medicine

@router.delete("/{medicine_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_role(["Admin"]))])
def delete_existing_medicine(medicine_id: int, db: Session = Depends(get_db)):
    db_medicine = crud.delete_medicine(db, medicine_id=medicine_id)
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return
