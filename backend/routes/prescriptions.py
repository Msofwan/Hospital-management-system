
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..auth import get_current_user, has_permission
from ..database import get_db
from ..schemas.prescription import Prescription, PrescriptionCreate, PrescriptionUpdate

router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "/",
    response_model=list[Prescription],
    dependencies=[Depends(has_permission("read_prescriptions"))],
)
def list_prescriptions(
    skip: int = 0,
    limit: int = 100,
    visit_id: int | None = None,
    db: Session = Depends(get_db),
):
    return crud.get_prescriptions(db, skip=skip, limit=limit, visit_id=visit_id)


@router.get(
    "/{prescription_id}",
    response_model=Prescription,
    dependencies=[Depends(has_permission("read_prescriptions"))],
)
def retrieve_prescription(prescription_id: int, db: Session = Depends(get_db)):
    prescription = crud.get_prescription(db, prescription_id)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescription


@router.post(
    "/",
    response_model=Prescription,
    dependencies=[Depends(has_permission("create_prescription"))],
)
def create_prescription(prescription: PrescriptionCreate, db: Session = Depends(get_db)):
    return crud.create_prescription(db, prescription)


@router.put(
    "/{prescription_id}",
    response_model=Prescription,
    dependencies=[Depends(has_permission("update_prescription"))],
)
def update_prescription(prescription_id: int, prescription: PrescriptionUpdate, db: Session = Depends(get_db)):
    db_prescription = crud.update_prescription(db, prescription_id, prescription)
    if not db_prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return db_prescription


@router.delete(
    "/{prescription_id}",
    response_model=Prescription,
    dependencies=[Depends(has_permission("delete_prescription"))],
)
def delete_prescription(prescription_id: int, db: Session = Depends(get_db)):
    db_prescription = crud.delete_prescription(db, prescription_id)
    if not db_prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return db_prescription
