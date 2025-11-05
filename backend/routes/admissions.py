
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..auth import get_current_user, has_permission
from ..database import get_db
from ..schemas.admission import Admission, AdmissionCreate, AdmissionUpdate

router = APIRouter(
    prefix="/admissions",
    tags=["Admissions"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=list[Admission], dependencies=[Depends(has_permission("read_admissions"))])
def list_admissions(
    skip: int = 0,
    limit: int = 100,
    patient_id: int | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    return crud.get_admissions(
        db,
        skip=skip,
        limit=limit,
        patient_id=patient_id,
        status=status,
    )


@router.get("/{admission_id}", response_model=Admission, dependencies=[Depends(has_permission("read_admissions"))])
def retrieve_admission(admission_id: int, db: Session = Depends(get_db)):
    admission = crud.get_admission(db, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    return admission


@router.post("/", response_model=Admission, dependencies=[Depends(has_permission("create_admission"))])
def create_admission(admission: AdmissionCreate, db: Session = Depends(get_db)):
    return crud.create_admission(db, admission)


@router.put("/{admission_id}", response_model=Admission, dependencies=[Depends(has_permission("update_admission"))])
def update_admission(admission_id: int, admission: AdmissionUpdate, db: Session = Depends(get_db)):
    db_admission = crud.update_admission(db, admission_id, admission)
    if not db_admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    return db_admission


@router.delete("/{admission_id}", response_model=Admission, dependencies=[Depends(has_permission("delete_admission"))])
def delete_admission(admission_id: int, db: Session = Depends(get_db)):
    db_admission = crud.delete_admission(db, admission_id)
    if not db_admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    return db_admission
