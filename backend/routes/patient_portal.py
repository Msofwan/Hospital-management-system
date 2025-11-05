import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models
from ..auth import create_patient_access_token, get_current_patient
from ..database import get_db
from ..schemas.patient_portal import (
    PatientPortalLoginRequest,
    PatientPortalLoginResponse,
    PatientPortalPatient,
    PatientPortalProfile,
)

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/patient-portal", tags=["Patient Portal"])


@router.post("/session", response_model=PatientPortalLoginResponse)
def create_patient_portal_session(
    payload: PatientPortalLoginRequest,
    db: Session = Depends(get_db),
):
    patient = crud.get_patient_by_email(db, email=payload.email)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient record not found")
    if patient.date_of_birth != payload.date_of_birth:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Date of birth does not match our records")

    expires_at = datetime.utcnow() + timedelta(minutes=15)
    token = create_patient_access_token(patient.id, expires_minutes=15)

    logger.info("Patient portal session issued for patient %s (%s)", patient.id, patient.email)

    return PatientPortalLoginResponse(token=token, expires_at=expires_at)


@router.get("/profile", response_model=PatientPortalProfile)
def get_patient_portal_profile(
    current_patient: models.patient.Patient = Depends(get_current_patient),
    db: Session = Depends(get_db),
):
    upcoming_appointments = (
        db.query(models.appointment.Appointment)
        .filter(models.appointment.Appointment.patient_id == current_patient.id)
        .filter(models.appointment.Appointment.appointment_date >= datetime.utcnow())
        .order_by(models.appointment.Appointment.appointment_date.asc())
        .limit(5)
        .all()
    )

    recent_invoices = (
        db.query(models.invoice.Invoice)
        .filter(models.invoice.Invoice.patient_id == current_patient.id)
        .order_by(models.invoice.Invoice.date_issued.desc())
        .limit(5)
        .all()
    )

    patient_summary = PatientPortalPatient(
        id=current_patient.id,
        first_name=current_patient.first_name,
        last_name=current_patient.last_name,
        email=current_patient.email,
        contact_number=current_patient.contact_number,
    )

    return PatientPortalProfile(
        patient=patient_summary,
        upcoming_appointments=upcoming_appointments,
        recent_invoices=recent_invoices,
    )
