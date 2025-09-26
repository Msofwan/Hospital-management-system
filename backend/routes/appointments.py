from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..schemas.appointment import Appointment, AppointmentCreate

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"],
)


@router.get("/", response_model=List[Appointment])
def get_all_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all appointments.
    """
    appointments = crud.get_appointments(db, skip=skip, limit=limit)
    return appointments


@router.post("/", response_model=Appointment)
def create_new_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    """
    Create a new appointment.
    """
    return crud.create_appointment(db=db, appointment=appointment)


@router.delete("/{appointment_id}", response_model=Appointment)
def delete_appointment_by_id(appointment_id: int, db: Session = Depends(get_db)):
    """
    Delete an appointment by ID.
    """
    db_appointment = crud.delete_appointment(db, appointment_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment


@router.put("/{appointment_id}", response_model=Appointment)
def update_appointment_by_id(appointment_id: int, appointment: AppointmentCreate, db: Session = Depends(get_db)):
    """
    Update an appointment by ID.
    """
    db_appointment = crud.update_appointment(db, appointment_id=appointment_id, appointment=appointment)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment
