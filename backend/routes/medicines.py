
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud
from ..auth import get_current_user, has_permission
from ..database import get_db
from ..schemas.medicine import Medicine, MedicineCreate, MedicineRestock, MedicineUpdate

router = APIRouter(
    prefix="/medicines",
    tags=["Medicines"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "/",
    response_model=list[Medicine],
    dependencies=[Depends(has_permission("read_medicines"))],
)
def get_all_medicines(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_medicines(db, skip=skip, limit=limit)

@router.post(
    "/",
    response_model=Medicine,
    dependencies=[Depends(has_permission("create_medicine"))],
)
def create_new_medicine(medicine: MedicineCreate, db: Session = Depends(get_db)):
    return crud.create_medicine(db=db, medicine=medicine)

@router.put(
    "/{medicine_id}",
    response_model=Medicine,
    dependencies=[Depends(has_permission("update_medicine"))],
)
def update_existing_medicine(medicine_id: int, medicine: MedicineUpdate, db: Session = Depends(get_db)):
    db_medicine = crud.update_medicine(db, medicine_id=medicine_id, medicine=medicine)
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return db_medicine

@router.post(
    "/{medicine_id}/restock",
    response_model=Medicine,
    dependencies=[Depends(has_permission("restock_medicine"))],
)
def restock_existing_medicine(medicine_id: int, restock: MedicineRestock, db: Session = Depends(get_db)):
    db_medicine = crud.restock_medicine(db, medicine_id=medicine_id, restock=restock)
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return db_medicine

@router.delete(
    "/{medicine_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(has_permission("delete_medicine"))],
)
def delete_existing_medicine(medicine_id: int, db: Session = Depends(get_db)):
    db_medicine = crud.delete_medicine(db, medicine_id=medicine_id)
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return
