from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..schemas.bed import Bed, BedCreate, BedUpdate

router = APIRouter(
    prefix="/beds",
    tags=["Beds"],
)


@router.get("/", response_model=List[Bed])
def get_all_beds(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all beds.
    """
    beds = crud.get_beds(db, skip=skip, limit=limit)
    return beds


@router.post("/", response_model=Bed)
def create_new_bed(bed: BedCreate, db: Session = Depends(get_db)):
    """
    Create a new bed.
    """
    return crud.create_bed(db=db, bed=bed)


@router.put("/{bed_id}", response_model=Bed)
def update_bed_by_id(bed_id: int, bed: BedUpdate, db: Session = Depends(get_db)):
    """
    Update a bed by ID, used for assigning or discharging a patient.
    """
    db_bed = crud.update_bed(db, bed_id=bed_id, bed=bed)
    if db_bed is None:
        raise HTTPException(status_code=404, detail="Bed not found")
    return db_bed


@router.delete("/{bed_id}", response_model=Bed)
def delete_bed_by_id(bed_id: int, db: Session = Depends(get_db)):
    """
    Delete a bed by ID.
    """
    db_bed = crud.delete_bed(db, bed_id=bed_id)
    if db_bed is None:
        raise HTTPException(status_code=404, detail="Bed not found")
    return db_bed
