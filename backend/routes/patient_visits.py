
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..auth import get_current_user, has_permission
from ..database import get_db
from ..schemas.patient_visit import PatientVisit, PatientVisitCreate, PatientVisitUpdate

router = APIRouter(
    prefix="/patient-visits",
    tags=["Patient Visits"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "/",
    response_model=list[PatientVisit],
    dependencies=[Depends(has_permission("read_patient_visits"))],
)
def list_patient_visits(
    skip: int = 0,
    limit: int = 100,
    patient_id: int | None = None,
    provider_id: int | None = None,
    db: Session = Depends(get_db),
):
    return crud.get_patient_visits(
        db,
        skip=skip,
        limit=limit,
        patient_id=patient_id,
        provider_id=provider_id,
    )


@router.get(
    "/{visit_id}",
    response_model=PatientVisit,
    dependencies=[Depends(has_permission("read_patient_visits"))],
)
def retrieve_patient_visit(visit_id: int, db: Session = Depends(get_db)):
    visit = crud.get_patient_visit(db, visit_id)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return visit


@router.post(
    "/",
    response_model=PatientVisit,
    dependencies=[Depends(has_permission("create_patient_visit"))],
)
def create_patient_visit(visit: PatientVisitCreate, db: Session = Depends(get_db)):
    return crud.create_patient_visit(db, visit)


@router.put(
    "/{visit_id}",
    response_model=PatientVisit,
    dependencies=[Depends(has_permission("update_patient_visit"))],
)
def update_patient_visit(visit_id: int, visit: PatientVisitUpdate, db: Session = Depends(get_db)):
    db_visit = crud.update_patient_visit(db, visit_id, visit)
    if not db_visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return db_visit


@router.delete(
    "/{visit_id}",
    response_model=PatientVisit,
    dependencies=[Depends(has_permission("delete_patient_visit"))],
)
def delete_patient_visit(visit_id: int, db: Session = Depends(get_db)):
    db_visit = crud.delete_patient_visit(db, visit_id)
    if not db_visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return db_visit
