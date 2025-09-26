from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models
from ..database import get_db
from ..schemas.staff import Staff, StaffCreate
from ..auth import get_current_user, has_permission

router = APIRouter(
    prefix="/staff",
    tags=["Staff"],
    dependencies=[Depends(get_current_user)] # Protect all routes in this router
)

@router.get("/", response_model=List[Staff], dependencies=[Depends(has_permission("read_staff"))])
def get_all_staff(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all staff members.
    """
    staff = crud.get_staff(db, skip=skip, limit=limit)
    return staff


@router.post("/", response_model=Staff, dependencies=[Depends(has_permission("create_staff"))])
def create_new_staff(staff: StaffCreate, db: Session = Depends(get_db)):
    """
    Create a new staff member.
    """
    # Check if user already exists
    db_user = crud.get_staff_by_email(db, email=staff.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_staff(db=db, staff=staff)


@router.put("/{staff_id}", response_model=Staff, dependencies=[Depends(has_permission("update_staff"))])
def update_staff_by_id(staff_id: int, staff: StaffCreate, db: Session = Depends(get_db)):
    """
    Update a staff member by ID.
    """
    db_staff = crud.update_staff(db, staff_id=staff_id, staff=staff)
    if db_staff is None:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return db_staff


@router.delete("/{staff_id}", response_model=Staff, dependencies=[Depends(has_permission("delete_staff"))])
def delete_staff_by_id(staff_id: int, db: Session = Depends(get_db)):
    """
    Delete a staff member by ID.
    """
    db_staff = crud.delete_staff(db, staff_id=staff_id)
    if db_staff is None:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return db_staff