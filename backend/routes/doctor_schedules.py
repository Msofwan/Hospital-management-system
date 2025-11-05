
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..auth import get_current_user, has_permission
from ..database import get_db
from ..schemas.doctor_schedule import DoctorSchedule, DoctorScheduleCreate, DoctorScheduleUpdate

router = APIRouter(
    prefix="/doctor-schedules",
    tags=["Doctor Schedules"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "/",
    response_model=list[DoctorSchedule],
    dependencies=[Depends(has_permission("read_doctor_schedules"))],
)
def list_doctor_schedules(
    skip: int = 0,
    limit: int = 100,
    staff_id: int | None = None,
    db: Session = Depends(get_db),
):
    return crud.get_doctor_schedules(db, skip=skip, limit=limit, staff_id=staff_id)


@router.get(
    "/{schedule_id}",
    response_model=DoctorSchedule,
    dependencies=[Depends(has_permission("read_doctor_schedules"))],
)
def retrieve_doctor_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = crud.get_doctor_schedule(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule


@router.post(
    "/",
    response_model=DoctorSchedule,
    dependencies=[Depends(has_permission("create_doctor_schedule"))],
)
def create_doctor_schedule(schedule: DoctorScheduleCreate, db: Session = Depends(get_db)):
    return crud.create_doctor_schedule(db, schedule)


@router.put(
    "/{schedule_id}",
    response_model=DoctorSchedule,
    dependencies=[Depends(has_permission("update_doctor_schedule"))],
)
def update_doctor_schedule(schedule_id: int, schedule: DoctorScheduleUpdate, db: Session = Depends(get_db)):
    db_schedule = crud.update_doctor_schedule(db, schedule_id, schedule)
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return db_schedule


@router.delete(
    "/{schedule_id}",
    response_model=DoctorSchedule,
    dependencies=[Depends(has_permission("delete_doctor_schedule"))],
)
def delete_doctor_schedule(schedule_id: int, db: Session = Depends(get_db)):
    db_schedule = crud.delete_doctor_schedule(db, schedule_id)
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return db_schedule
