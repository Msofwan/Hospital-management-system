
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, models
from ..auth import get_current_user, has_permission
from ..database import get_db
from ..schemas.dispensation import Dispensation, DispensationCreate

router = APIRouter(
    prefix="/dispensations",
    tags=["Dispensations"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "/",
    response_model=list[Dispensation],
    dependencies=[Depends(has_permission("read_dispensations"))],
)
def get_all_dispensations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_dispensations(db, skip=skip, limit=limit)

@router.post(
    "/",
    response_model=Dispensation,
    dependencies=[Depends(has_permission("create_dispensation"))],
)
def create_new_dispensation(
    dispensation: DispensationCreate,
    db: Session = Depends(get_db),
    current_user: models.staff.Staff = Depends(get_current_user),
):
    db_dispensation = crud.create_dispensation(
        db=db,
        dispensation=dispensation,
        staff_id=current_user.id,
    )
    if db_dispensation is None:
        # This could be due to medicine not found or insufficient stock
        raise HTTPException(
            status_code=400,
            detail="Failed to create dispensation. Check medicine ID and stock levels.",
        )
    return db_dispensation
