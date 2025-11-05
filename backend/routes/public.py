import logging
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..schemas.appointment_request import AppointmentRequestCreate, AppointmentRequestReceipt
from ..schemas.public import DoctorPublicProfile, DoctorSchedulePublic

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/public", tags=["Public"])


def _build_doctor_profile(doctor) -> DoctorPublicProfile:
    schedules = [
        DoctorSchedulePublic(
            day_of_week=schedule.day_of_week,
            start_time=schedule.start_time,
            end_time=schedule.end_time,
            location=schedule.location,
            notes=schedule.notes,
        )
        for schedule in sorted(doctor.schedules, key=lambda s: (s.day_of_week, s.start_time))
    ]

    now = datetime.utcnow()
    upcoming_slots: list[str] = []
    for day_offset in range(0, 21):
        current_date = now.date() + timedelta(days=day_offset)
        day_name = current_date.strftime("%A")
        for schedule in schedules:
            if schedule.day_of_week == day_name:
                slot_datetime = datetime.combine(current_date, schedule.start_time)
                if slot_datetime > now:
                    upcoming_slots.append(slot_datetime.isoformat())
        if len(upcoming_slots) >= 6:
            break

    return DoctorPublicProfile(
        id=doctor.id,
        first_name=doctor.first_name,
        last_name=doctor.last_name,
        department=doctor.department,
        specialization=doctor.specialization,
        employment_type=doctor.employment_type,
        schedules=schedules,
        next_available_slots=upcoming_slots[:6],
    )


@router.get("/doctors", response_model=list[DoctorPublicProfile])
def get_doctors(db: Session = Depends(get_db)):
    doctors = crud.get_public_doctors(db)
    return [_build_doctor_profile(doctor) for doctor in doctors]


@router.get("/doctors/{doctor_id}", response_model=DoctorPublicProfile)
def get_doctor_detail(doctor_id: int, db: Session = Depends(get_db)):
    doctor = crud.get_public_doctor(db, doctor_id)
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return _build_doctor_profile(doctor)


@router.post("/appointment-requests", response_model=AppointmentRequestReceipt, status_code=status.HTTP_201_CREATED)
def submit_appointment_request(request: AppointmentRequestCreate, db: Session = Depends(get_db)):
    if request.preferred_date < date.today():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Preferred date cannot be in the past")
    if request.preferred_doctor_id:
        doctor = crud.get_public_doctor(db, request.preferred_doctor_id)
        if doctor is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected doctor is unavailable")

    db_request = crud.create_appointment_request(db, request)
    logger.info(
        "Appointment request %s created for %s (%s)",
        db_request.id,
        db_request.full_name,
        db_request.email,
    )
    return AppointmentRequestReceipt(
        id=db_request.id,
        status=db_request.status,
        message="Your appointment request has been received. Our team will contact you shortly.",
    )
