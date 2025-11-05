import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud
from ..auth import get_current_user, has_permission
from ..database import get_db
from ..models.staff import Staff
from ..schemas.appointment_request import (
    AppointmentRequest,
    AppointmentRequestApprove,
    AppointmentRequestUpdate,
)

logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/appointment-requests",
    tags=["Appointment Requests"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "/",
    response_model=list[AppointmentRequest],
    dependencies=[Depends(has_permission("read_appointment_requests"))],
)
def list_appointment_requests(
    status: str | None = None,
    preferred_doctor_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return crud.get_appointment_requests(
        db,
        skip=skip,
        limit=min(limit, 200),
        status=status,
        preferred_doctor_id=preferred_doctor_id,
    )


@router.get(
    "/{request_id}",
    response_model=AppointmentRequest,
    dependencies=[Depends(has_permission("read_appointment_requests"))],
)
def get_appointment_request(request_id: int, db: Session = Depends(get_db)):
    db_request = crud.get_appointment_request(db, request_id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment request not found")
    return db_request


@router.put(
    "/{request_id}",
    response_model=AppointmentRequest,
    dependencies=[Depends(has_permission("update_appointment_requests"))],
)
def update_request_status(
    request_id: int,
    payload: AppointmentRequestUpdate,
    current_user: Staff = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_request = crud.update_appointment_request(db, request_id, payload, handler_id=current_user.id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment request not found")
    logger.info(
        "Appointment request %s updated to %s by staff %s",
        request_id,
        db_request.status,
        current_user.id,
    )
    return db_request


@router.post(
    "/{request_id}/approve",
    response_model=AppointmentRequest,
    dependencies=[Depends(has_permission("approve_appointment_requests"))],
)
def approve_request(
    request_id: int,
    payload: AppointmentRequestApprove,
    current_user: Staff = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.patient_id <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient selection is required")

    if payload.provider_id is None and not payload.doctor_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either provider_id or doctor_name must be supplied",
        )

    db_request = crud.approve_appointment_request(db, request_id, payload, handler_id=current_user.id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment request not found")
    if db_request.status != "Approved":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request could not be approved")

    logger.info(
        "Appointment request %s approved by staff %s and converted to appointment %s",
        request_id,
        current_user.id,
        db_request.converted_appointment_id,
    )
    return db_request
