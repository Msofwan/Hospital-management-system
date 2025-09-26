from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..schemas.patient import Patient, PatientCreate
from ..auth import get_current_user, has_permission

router = APIRouter(
    prefix="/patients",
    tags=["Patients"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/", response_model=List[Patient], dependencies=[Depends(has_permission("read_patients"))])
def get_all_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all patients.
    """
    patients = crud.get_patients(db, skip=skip, limit=limit)
    return patients


@router.post("/", response_model=Patient, dependencies=[Depends(has_permission("create_patient"))])
def create_new_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    """
    Create a new patient.
    """
    return crud.create_patient(db=db, patient=patient)


@router.delete("/{patient_id}", response_model=Patient, dependencies=[Depends(has_permission("delete_patient"))])
def delete_patient_by_id(patient_id: int, db: Session = Depends(get_db)):
    """
    Delete a patient by ID.
    """
    db_patient = crud.delete_patient(db, patient_id=patient_id)
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient


@router.put("/{patient_id}", response_model=Patient, dependencies=[Depends(has_permission("update_patient"))])
def update_patient_by_id(patient_id: int, patient: PatientCreate, db: Session = Depends(get_db)):
    """
    Update a patient by ID.
    """
    db_patient = crud.update_patient(db, patient_id=patient_id, patient=patient)
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient