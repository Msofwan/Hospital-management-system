
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..auth import get_current_user, has_permission
from ..database import get_db
from ..schemas.lab_result import LabResult, LabResultCreate, LabResultUpdate

router = APIRouter(
    prefix="/lab-results",
    tags=["Lab Results"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "/",
    response_model=list[LabResult],
    dependencies=[Depends(has_permission("read_lab_results"))],
)
def list_lab_results(
    skip: int = 0,
    limit: int = 100,
    visit_id: int | None = None,
    db: Session = Depends(get_db),
):
    return crud.get_lab_results(db, skip=skip, limit=limit, visit_id=visit_id)


@router.get(
    "/{lab_result_id}",
    response_model=LabResult,
    dependencies=[Depends(has_permission("read_lab_results"))],
)
def retrieve_lab_result(lab_result_id: int, db: Session = Depends(get_db)):
    lab_result = crud.get_lab_result(db, lab_result_id)
    if not lab_result:
        raise HTTPException(status_code=404, detail="Lab result not found")
    return lab_result


@router.post(
    "/",
    response_model=LabResult,
    dependencies=[Depends(has_permission("create_lab_result"))],
)
def create_lab_result(lab_result: LabResultCreate, db: Session = Depends(get_db)):
    return crud.create_lab_result(db, lab_result)


@router.put(
    "/{lab_result_id}",
    response_model=LabResult,
    dependencies=[Depends(has_permission("update_lab_result"))],
)
def update_lab_result(lab_result_id: int, lab_result: LabResultUpdate, db: Session = Depends(get_db)):
    db_lab_result = crud.update_lab_result(db, lab_result_id, lab_result)
    if not db_lab_result:
        raise HTTPException(status_code=404, detail="Lab result not found")
    return db_lab_result


@router.delete(
    "/{lab_result_id}",
    response_model=LabResult,
    dependencies=[Depends(has_permission("delete_lab_result"))],
)
def delete_lab_result(lab_result_id: int, db: Session = Depends(get_db)):
    db_lab_result = crud.delete_lab_result(db, lab_result_id)
    if not db_lab_result:
        raise HTTPException(status_code=404, detail="Lab result not found")
    return db_lab_result
