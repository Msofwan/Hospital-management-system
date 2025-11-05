from sqlalchemy.orm import Session, joinedload

from . import models
from .schemas.admission import AdmissionCreate, AdmissionUpdate
from .schemas.appointment import AppointmentCreate, AppointmentUpdate
from .schemas.appointment_request import AppointmentRequestApprove, AppointmentRequestCreate, AppointmentRequestUpdate
from .schemas.bed import BedCreate, BedUpdate
from .schemas.dispensation import DispensationCreate
from .schemas.doctor_schedule import DoctorScheduleCreate, DoctorScheduleUpdate
from .schemas.invoice import InvoiceCreate, InvoiceUpdate
from .schemas.lab_result import LabResultCreate, LabResultUpdate
from .schemas.medicine import MedicineCreate, MedicineRestock, MedicineUpdate
from .schemas.patient import PatientCreate, PatientUpdate
from .schemas.patient_visit import PatientVisitCreate, PatientVisitUpdate
from .schemas.prescription import PrescriptionCreate, PrescriptionUpdate
from .schemas.role import RoleCreate, RoleUpdate
from .schemas.staff import StaffCreate, StaffUpdate
from .security import get_password_hash

# ... (Patient, Appointment, Bed CRUD functions remain the same) ...

# Patient CRUD functions
def get_patients(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.patient.Patient)
        .options(
            joinedload(models.patient.Patient.appointments),
            joinedload(models.patient.Patient.bed),
            joinedload(models.patient.Patient.visits)
            .joinedload(models.patient_visit.PatientVisit.prescriptions),
            joinedload(models.patient.Patient.visits)
            .joinedload(models.patient_visit.PatientVisit.lab_results),
            joinedload(models.patient.Patient.invoices),
            joinedload(models.patient.Patient.admissions)
            .joinedload(models.admission.Admission.bed),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

def delete_patient(db: Session, patient_id: int):
    db_patient = db.query(models.patient.Patient).filter(models.patient.Patient.id == patient_id).first()
    if db_patient:
        db.delete(db_patient)
        db.commit()
    return db_patient

def update_patient(db: Session, patient_id: int, patient: PatientUpdate):
    db_patient = db.query(models.patient.Patient).filter(models.patient.Patient.id == patient_id).first()
    if db_patient:
        update_data = patient.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_patient, key, value)
        db.commit()
        db.refresh(db_patient)
    return db_patient

def create_patient(db: Session, patient: PatientCreate):
    db_patient = models.patient.Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

# Appointment CRUD functions
def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.appointment.Appointment)
        .options(
            joinedload(models.appointment.Appointment.patient),
            joinedload(models.appointment.Appointment.provider),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_appointment(db: Session, appointment: AppointmentCreate):
    appointment_data = appointment.dict()
    if not appointment_data.get("doctor_name") and appointment_data.get("provider_id"):
        provider = (
            db.query(models.staff.Staff)
            .filter(models.staff.Staff.id == appointment_data["provider_id"])
            .first()
        )
        if provider:
            appointment_data["doctor_name"] = f"{provider.first_name} {provider.last_name}".strip()
    db_appointment = models.appointment.Appointment(**appointment_data)
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment(db: Session, appointment_id: int, appointment: AppointmentUpdate):
    db_appointment = (
        db.query(models.appointment.Appointment)
        .filter(models.appointment.Appointment.id == appointment_id)
        .first()
    )
    if db_appointment:
        update_data = appointment.dict(exclude_unset=True)
        if "provider_id" in update_data and "doctor_name" not in update_data:
            provider = (
                db.query(models.staff.Staff)
                .filter(models.staff.Staff.id == update_data["provider_id"])
                .first()
            )
            if provider:
                update_data["doctor_name"] = f"{provider.first_name} {provider.last_name}".strip()
        for key, value in update_data.items():
            setattr(db_appointment, key, value)
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

def delete_appointment(db: Session, appointment_id: int):
    db_appointment = (
        db.query(models.appointment.Appointment)
        .filter(models.appointment.Appointment.id == appointment_id)
        .first()
    )
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
    return db_appointment

# Bed CRUD functions
def get_beds(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.bed.Bed)
        .options(
            joinedload(models.bed.Bed.patient),
            joinedload(models.bed.Bed.admissions),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_bed(db: Session, bed: BedCreate):
    db_bed = models.bed.Bed(**bed.dict())
    db.add(db_bed)
    db.commit()
    db.refresh(db_bed)
    return db_bed

def update_bed(db: Session, bed_id: int, bed: BedUpdate):
    db_bed = db.query(models.bed.Bed).filter(models.bed.Bed.id == bed_id).first()
    if db_bed:
        update_data = bed.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_bed, key, value)
        db.commit()
        db.refresh(db_bed)
    return db_bed

def delete_bed(db: Session, bed_id: int):
    db_bed = db.query(models.bed.Bed).filter(models.bed.Bed.id == bed_id).first()
    if db_bed:
        db.delete(db_bed)
        db.commit()
    return db_bed

# --- Refactored Staff and New Role CRUD functions ---

# Role CRUD
def get_role(db: Session, role_id: int):
    return (
        db.query(models.role.Role)
        .filter(models.role.Role.id == role_id)
        .first()
    )


def get_role_by_name(db: Session, name: str):
    return (
        db.query(models.role.Role)
        .filter(models.role.Role.name == name)
        .first()
    )


def get_roles(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.role.Role)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_role(db: Session, role: RoleCreate):
    db_role = models.role.Role(name=role.name, description=role.description)
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role


def update_role(db: Session, role_id: int, role: RoleUpdate):
    db_role = get_role(db, role_id)
    if db_role:
        update_data = role.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_role, key, value)
        db.commit()
        db.refresh(db_role)
    return db_role

def delete_role(db: Session, role_id: int):
    db_role = get_role(db, role_id)
    if db_role:
        db.delete(db_role)
        db.commit()
    return db_role

# Staff CRUD (Updated)
def get_staff_by_email(db: Session, email: str):
    return db.query(models.staff.Staff).options(
        joinedload(models.staff.Staff.role)
        .joinedload(models.role.Role.permissions)
        .joinedload(models.role_permission.RolePermission.permission),
        joinedload(models.staff.Staff.schedules),
    ).filter(models.staff.Staff.email == email).first()


def get_staff_member(db: Session, staff_id: int):
    return db.query(models.staff.Staff).options(
        joinedload(models.staff.Staff.role)
        .joinedload(models.role.Role.permissions)
        .joinedload(models.role_permission.RolePermission.permission),
        joinedload(models.staff.Staff.schedules),
    ).filter(models.staff.Staff.id == staff_id).first()


def get_staff(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.staff.Staff)
        .options(
            joinedload(models.staff.Staff.role),
            joinedload(models.staff.Staff.schedules),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_staff(db: Session, staff: StaffCreate):
    hashed_password = get_password_hash(staff.password)
    # Create a dictionary of staff data, excluding the password
    db_staff_data = staff.dict(exclude={"password"})
    db_staff = models.staff.Staff(**db_staff_data, hashed_password=hashed_password)
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

def update_staff(db: Session, staff_id: int, staff: StaffUpdate):
    db_staff = db.query(models.staff.Staff).filter(models.staff.Staff.id == staff_id).first()
    if db_staff:
        update_data = staff.dict(exclude_unset=True)
        if "password" in update_data and update_data["password"]:
            hashed_password = get_password_hash(update_data["password"])
            db_staff.hashed_password = hashed_password
            del update_data["password"]
        
        for key, value in update_data.items():
            setattr(db_staff, key, value)
        
        db.commit()
        db.refresh(db_staff)
    return db_staff

def delete_staff(db: Session, staff_id: int):
    # Eagerly load the role relationship before the session is closed by the commit
    db_staff = db.query(models.staff.Staff).options(
        joinedload(models.staff.Staff.role)
    ).filter(models.staff.Staff.id == staff_id).first()
    
    if db_staff:
        db.delete(db_staff)
        db.commit()
    return db_staff

# Invoice CRUD
def get_invoices(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.invoice.Invoice)
        .options(joinedload(models.invoice.Invoice.patient))
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_invoice(db: Session, invoice_id: int):
    return (
        db.query(models.invoice.Invoice)
        .options(joinedload(models.invoice.Invoice.patient))
        .filter(models.invoice.Invoice.id == invoice_id)
        .first()
    )

def create_invoice(db: Session, invoice: InvoiceCreate):
    db_invoice = models.invoice.Invoice(**invoice.dict())
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def update_invoice(db: Session, invoice_id: int, invoice_update: InvoiceUpdate):
    db_invoice = db.query(models.invoice.Invoice).filter(models.invoice.Invoice.id == invoice_id).first()
    if db_invoice:
        update_data = invoice_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_invoice, key, value)
        db.commit()
        db.refresh(db_invoice)
    return db_invoice

# Medicine CRUD
def get_medicines(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.medicine.Medicine)
        .options(joinedload(models.medicine.Medicine.dispensations))
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_medicine(db: Session, medicine_id: int):
    return db.query(models.medicine.Medicine).filter(models.medicine.Medicine.id == medicine_id).first()

def create_medicine(db: Session, medicine: MedicineCreate):
    db_medicine = models.medicine.Medicine(**medicine.dict())
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine

def update_medicine(db: Session, medicine_id: int, medicine: MedicineUpdate):
    db_medicine = get_medicine(db, medicine_id)
    if db_medicine:
        update_data = medicine.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_medicine, key, value)
        db.commit()
        db.refresh(db_medicine)
    return db_medicine

def restock_medicine(db: Session, medicine_id: int, restock: MedicineRestock):
    db_medicine = get_medicine(db, medicine_id)
    if db_medicine:
        db_medicine.stock_quantity += restock.quantity_added
        db.commit()
        db.refresh(db_medicine)
    return db_medicine

def delete_medicine(db: Session, medicine_id: int):
    db_medicine = get_medicine(db, medicine_id)
    if db_medicine:
        db.delete(db_medicine)
        db.commit()
    return db_medicine

# Dispensation CRUD
def get_dispensations(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.dispensation.Dispensation)
        .options(
            joinedload(models.dispensation.Dispensation.patient),
            joinedload(models.dispensation.Dispensation.medicine),
            joinedload(models.dispensation.Dispensation.staff),
            joinedload(models.dispensation.Dispensation.prescription),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_dispensation(db: Session, dispensation: DispensationCreate, staff_id: int):
    db_medicine = get_medicine(db, dispensation.medicine_id)
    if not db_medicine:
        return None # Or raise exception
    if db_medicine.stock_quantity < dispensation.quantity_dispensed:
        return None # Or raise exception

    # Atomically update stock and create dispensation record
    db_medicine.stock_quantity -= dispensation.quantity_dispensed
    db_dispensation = models.dispensation.Dispensation(**dispensation.dict(), staff_id=staff_id)
    
    db.add(db_dispensation)
    db.commit()
    db.refresh(db_dispensation)
    
    return db_dispensation


# Doctor Schedule CRUD
def get_doctor_schedules(db: Session, skip: int = 0, limit: int = 100, staff_id: int | None = None):
    query = (
        db.query(models.doctor_schedule.DoctorSchedule)
        .options(joinedload(models.doctor_schedule.DoctorSchedule.provider))
    )
    if staff_id is not None:
        query = query.filter(models.doctor_schedule.DoctorSchedule.staff_id == staff_id)
    return query.offset(skip).limit(limit).all()


def get_doctor_schedule(db: Session, schedule_id: int):
    return (
        db.query(models.doctor_schedule.DoctorSchedule)
        .options(joinedload(models.doctor_schedule.DoctorSchedule.provider))
        .filter(models.doctor_schedule.DoctorSchedule.id == schedule_id)
        .first()
    )


def create_doctor_schedule(db: Session, schedule: DoctorScheduleCreate):
    db_schedule = models.doctor_schedule.DoctorSchedule(**schedule.dict())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule


def update_doctor_schedule(db: Session, schedule_id: int, schedule: DoctorScheduleUpdate):
    db_schedule = get_doctor_schedule(db, schedule_id)
    if db_schedule:
        update_data = schedule.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_schedule, key, value)
        db.commit()
        db.refresh(db_schedule)
    return db_schedule


def delete_doctor_schedule(db: Session, schedule_id: int):
    db_schedule = get_doctor_schedule(db, schedule_id)
    if db_schedule:
        db.delete(db_schedule)
        db.commit()
    return db_schedule


# Patient Visit CRUD
def get_patient_visits(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    patient_id: int | None = None,
    provider_id: int | None = None,
):
    query = (
        db.query(models.patient_visit.PatientVisit)
        .options(
            joinedload(models.patient_visit.PatientVisit.patient),
            joinedload(models.patient_visit.PatientVisit.provider),
            joinedload(models.patient_visit.PatientVisit.prescriptions),
            joinedload(models.patient_visit.PatientVisit.lab_results),
        )
    )
    if patient_id is not None:
        query = query.filter(models.patient_visit.PatientVisit.patient_id == patient_id)
    if provider_id is not None:
        query = query.filter(models.patient_visit.PatientVisit.provider_id == provider_id)
    return query.offset(skip).limit(limit).all()


def get_patient_visit(db: Session, visit_id: int):
    return (
        db.query(models.patient_visit.PatientVisit)
        .options(
            joinedload(models.patient_visit.PatientVisit.patient),
            joinedload(models.patient_visit.PatientVisit.provider),
            joinedload(models.patient_visit.PatientVisit.prescriptions),
            joinedload(models.patient_visit.PatientVisit.lab_results),
        )
        .filter(models.patient_visit.PatientVisit.id == visit_id)
        .first()
    )


def create_patient_visit(db: Session, visit: PatientVisitCreate):
    visit_data = visit.dict()
    db_visit = models.patient_visit.PatientVisit(**visit_data)
    db.add(db_visit)
    db.commit()
    db.refresh(db_visit)

    # If visit is linked to an appointment, mark appointment completed by default
    if db_visit.appointment_id:
        appointment = (
            db.query(models.appointment.Appointment)
            .filter(models.appointment.Appointment.id == db_visit.appointment_id)
            .first()
        )
        if appointment and appointment.status == "Scheduled":
            appointment.status = "Completed"
            db.commit()

    return db_visit


def update_patient_visit(db: Session, visit_id: int, visit: PatientVisitUpdate):
    db_visit = get_patient_visit(db, visit_id)
    if db_visit:
        update_data = visit.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_visit, key, value)
        db.commit()
        db.refresh(db_visit)
    return db_visit


def delete_patient_visit(db: Session, visit_id: int):
    db_visit = get_patient_visit(db, visit_id)
    if db_visit:
        db.delete(db_visit)
        db.commit()
    return db_visit


# Prescription CRUD
def get_prescriptions(db: Session, skip: int = 0, limit: int = 100, visit_id: int | None = None):
    query = db.query(models.prescription.Prescription).options(
        joinedload(models.prescription.Prescription.visit)
    )
    if visit_id is not None:
        query = query.filter(models.prescription.Prescription.visit_id == visit_id)
    return query.offset(skip).limit(limit).all()


def get_prescription(db: Session, prescription_id: int):
    return (
        db.query(models.prescription.Prescription)
        .options(joinedload(models.prescription.Prescription.visit))
        .filter(models.prescription.Prescription.id == prescription_id)
        .first()
    )


def create_prescription(db: Session, prescription: PrescriptionCreate):
    db_prescription = models.prescription.Prescription(**prescription.dict())
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    return db_prescription


def update_prescription(db: Session, prescription_id: int, prescription: PrescriptionUpdate):
    db_prescription = get_prescription(db, prescription_id)
    if db_prescription:
        update_data = prescription.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_prescription, key, value)
        db.commit()
        db.refresh(db_prescription)
    return db_prescription


def delete_prescription(db: Session, prescription_id: int):
    db_prescription = get_prescription(db, prescription_id)
    if db_prescription:
        db.delete(db_prescription)
        db.commit()
    return db_prescription


# Lab Result CRUD
def get_lab_results(db: Session, skip: int = 0, limit: int = 100, visit_id: int | None = None):
    query = db.query(models.lab_result.LabResult).options(
        joinedload(models.lab_result.LabResult.visit)
    )
    if visit_id is not None:
        query = query.filter(models.lab_result.LabResult.visit_id == visit_id)
    return query.offset(skip).limit(limit).all()


def get_lab_result(db: Session, lab_result_id: int):
    return (
        db.query(models.lab_result.LabResult)
        .options(joinedload(models.lab_result.LabResult.visit))
        .filter(models.lab_result.LabResult.id == lab_result_id)
        .first()
    )


def create_lab_result(db: Session, lab_result: LabResultCreate):
    db_lab_result = models.lab_result.LabResult(**lab_result.dict())
    db.add(db_lab_result)
    db.commit()
    db.refresh(db_lab_result)
    return db_lab_result


def update_lab_result(db: Session, lab_result_id: int, lab_result: LabResultUpdate):
    db_lab_result = get_lab_result(db, lab_result_id)
    if db_lab_result:
        update_data = lab_result.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_lab_result, key, value)
        db.commit()
        db.refresh(db_lab_result)
    return db_lab_result


def delete_lab_result(db: Session, lab_result_id: int):
    db_lab_result = get_lab_result(db, lab_result_id)
    if db_lab_result:
        db.delete(db_lab_result)
        db.commit()
    return db_lab_result


# Admission CRUD
def get_admissions(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    patient_id: int | None = None,
    status: str | None = None,
):
    query = db.query(models.admission.Admission).options(
        joinedload(models.admission.Admission.patient),
        joinedload(models.admission.Admission.bed),
        joinedload(models.admission.Admission.attending_provider),
    )
    if patient_id is not None:
        query = query.filter(models.admission.Admission.patient_id == patient_id)
    if status is not None:
        query = query.filter(models.admission.Admission.status == status)
    return query.offset(skip).limit(limit).all()


def get_admission(db: Session, admission_id: int):
    return (
        db.query(models.admission.Admission)
        .options(
            joinedload(models.admission.Admission.patient),
            joinedload(models.admission.Admission.bed),
            joinedload(models.admission.Admission.attending_provider),
        )
        .filter(models.admission.Admission.id == admission_id)
        .first()
    )


def create_admission(db: Session, admission: AdmissionCreate):
    admission_data = admission.dict()

    # If assigning a bed, mark the bed occupied
    bed_id = admission_data.get("bed_id")
    if bed_id:
        bed = db.query(models.bed.Bed).filter(models.bed.Bed.id == bed_id).first()
        if bed:
            bed.is_occupied = True
            bed.patient_id = admission_data["patient_id"]

    db_admission = models.admission.Admission(**admission_data)
    db.add(db_admission)
    db.commit()
    db.refresh(db_admission)
    return db_admission


def update_admission(db: Session, admission_id: int, admission: AdmissionUpdate):
    db_admission = get_admission(db, admission_id)
    if db_admission:
        update_data = admission.dict(exclude_unset=True)

        # Handle bed reassignment
        if "bed_id" in update_data:
            new_bed_id = update_data.get("bed_id")
            if db_admission.bed_id and db_admission.bed_id != new_bed_id:
                previous_bed = db.query(models.bed.Bed).filter(models.bed.Bed.id == db_admission.bed_id).first()
                if previous_bed:
                    previous_bed.is_occupied = False
                    previous_bed.patient_id = None
            if new_bed_id:
                new_bed = db.query(models.bed.Bed).filter(models.bed.Bed.id == new_bed_id).first()
                if new_bed:
                    new_bed.is_occupied = True
                    new_bed.patient_id = db_admission.patient_id

        if "status" in update_data and update_data["status"] == "Discharged":
            bed = db_admission.bed
            if bed:
                bed.is_occupied = False
                bed.patient_id = None

        for key, value in update_data.items():
            setattr(db_admission, key, value)

        db.commit()
        db.refresh(db_admission)
    return db_admission


def delete_admission(db: Session, admission_id: int):
    db_admission = get_admission(db, admission_id)
    if db_admission:
        bed = db_admission.bed
        if bed:
            bed.is_occupied = False
            bed.patient_id = None
        db.delete(db_admission)
        db.commit()
    return db_admission


# Public-facing helpers
def get_patient(db: Session, patient_id: int):
    return db.query(models.patient.Patient).filter(models.patient.Patient.id == patient_id).first()


def get_patient_by_email(db: Session, email: str):
    return db.query(models.patient.Patient).filter(models.patient.Patient.email == email).first()


def get_appointment_requests(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: str | None = None,
    preferred_doctor_id: int | None = None,
):
    query = (
        db.query(models.appointment_request.AppointmentRequest)
        .options(
            joinedload(models.appointment_request.AppointmentRequest.preferred_doctor),
            joinedload(models.appointment_request.AppointmentRequest.handled_by_staff),
            joinedload(models.appointment_request.AppointmentRequest.converted_appointment)
            .joinedload(models.appointment.Appointment.provider),
        )
        .order_by(models.appointment_request.AppointmentRequest.created_at.desc())
    )
    if status:
        query = query.filter(models.appointment_request.AppointmentRequest.status == status)
    if preferred_doctor_id:
        query = query.filter(models.appointment_request.AppointmentRequest.preferred_doctor_id == preferred_doctor_id)
    return query.offset(skip).limit(limit).all()


def get_appointment_request(db: Session, request_id: int):
    return (
        db.query(models.appointment_request.AppointmentRequest)
        .options(
            joinedload(models.appointment_request.AppointmentRequest.preferred_doctor),
            joinedload(models.appointment_request.AppointmentRequest.handled_by_staff),
            joinedload(models.appointment_request.AppointmentRequest.converted_appointment)
            .joinedload(models.appointment.Appointment.provider),
        )
        .filter(models.appointment_request.AppointmentRequest.id == request_id)
        .first()
    )


def update_appointment_request(
    db: Session,
    request_id: int,
    request_update: AppointmentRequestUpdate,
    handler_id: int | None = None,
):
    db_request = get_appointment_request(db, request_id)
    if not db_request:
        return None
    update_data = request_update.dict(exclude_unset=True)
    if handler_id is not None:
        db_request.handled_by_staff_id = handler_id
    for key, value in update_data.items():
        setattr(db_request, key, value)
    db.commit()
    db.refresh(db_request)
    return db_request


def approve_appointment_request(
    db: Session,
    request_id: int,
    approval: AppointmentRequestApprove,
    handler_id: int,
):
    db_request = get_appointment_request(db, request_id)
    if not db_request:
        return None
    if db_request.status not in {"Pending", "In Review"}:
        return db_request

    appointment_data = AppointmentCreate(
        patient_id=approval.patient_id,
        provider_id=approval.provider_id,
        doctor_name=approval.doctor_name,
        appointment_date=approval.appointment_date,
        reason=approval.reason,
        status=approval.status or "Scheduled",
        location=approval.location,
        appointment_type=approval.appointment_type,
    )

    appointment = create_appointment(db, appointment_data)

    db_request.status = "Approved"
    db_request.handled_by_staff_id = handler_id
    db_request.decision_notes = approval.decision_notes
    db_request.converted_appointment_id = appointment.id
    db.commit()
    db.refresh(db_request)
    return db_request


def get_public_doctors(db: Session):
    return (
        db.query(models.staff.Staff)
        .options(joinedload(models.staff.Staff.schedules))
        .join(models.role.Role)
        .filter(models.role.Role.name == "Doctor")
        .all()
    )


def get_public_doctor(db: Session, doctor_id: int):
    return (
        db.query(models.staff.Staff)
        .options(joinedload(models.staff.Staff.schedules))
        .join(models.role.Role)
        .filter(models.role.Role.name == "Doctor")
        .filter(models.staff.Staff.id == doctor_id)
        .first()
    )


def create_appointment_request(db: Session, request: AppointmentRequestCreate):
    db_request = models.appointment_request.AppointmentRequest(**request.dict())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

