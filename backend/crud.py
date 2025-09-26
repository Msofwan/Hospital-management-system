from sqlalchemy.orm import Session, joinedload

from . import models
from .schemas.patient import PatientCreate
from .schemas.appointment import AppointmentCreate
from .schemas.bed import BedCreate, BedUpdate
from .schemas.staff import StaffCreate
from .schemas.role import RoleCreate, RoleUpdate
from .schemas.invoice import InvoiceCreate, InvoiceUpdate
from .schemas.medicine import MedicineCreate, MedicineUpdate, MedicineRestock
from .schemas.dispensation import DispensationCreate
from .security import get_password_hash

# ... (Patient, Appointment, Bed CRUD functions remain the same) ...

# Patient CRUD functions
def get_patients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.patient.Patient).offset(skip).limit(limit).all()

def delete_patient(db: Session, patient_id: int):
    db_patient = db.query(models.patient.Patient).filter(models.patient.Patient.id == patient_id).first()
    if db_patient:
        db.delete(db_patient)
        db.commit()
    return db_patient

def update_patient(db: Session, patient_id: int, patient: PatientCreate):
    db_patient = db.query(models.patient.Patient).filter(models.patient.Patient.id == patient_id).first()
    if db_patient:
        for key, value in patient.dict().items():
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
    return db.query(models.appointment.Appointment).offset(skip).limit(limit).all()

def create_appointment(db: Session, appointment: AppointmentCreate):
    db_appointment = models.appointment.Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment(db: Session, appointment_id: int, appointment: AppointmentCreate):
    db_appointment = db.query(models.appointment.Appointment).filter(models.appointment.Appointment.id == appointment_id).first()
    if db_appointment:
        for key, value in appointment.dict().items():
            setattr(db_appointment, key, value)
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

def delete_appointment(db: Session, appointment_id: int):
    db_appointment = db.query(models.appointment.Appointment).filter(models.appointment.Appointment.id == appointment_id).first()
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
    return db_appointment

# Bed CRUD functions
def get_beds(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.bed.Bed).offset(skip).limit(limit).all()

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
    return db.query(models.role.Role).filter(models.role.Role.id == role_id).first()

def get_role_by_name(db: Session, name: str):
    return db.query(models.role.Role).filter(models.role.Role.name == name).first()

def get_roles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.role.Role).offset(skip).limit(limit).all()

def create_role(db: Session, role: RoleCreate):
    db_role = models.role.Role(name=role.name, description=role.description)
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def get_role(db: Session, role_id: int):
    return db.query(models.role.Role).filter(models.role.Role.id == role_id).first()

def get_roles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.role.Role).offset(skip).limit(limit).all()

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
        joinedload(models.staff.Staff.role).joinedload(models.role.Role.permissions).joinedload(models.role_permission.RolePermission.permission)
    ).filter(models.staff.Staff.email == email).first()
def get_staff(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.staff.Staff).offset(skip).limit(limit).all()

def create_staff(db: Session, staff: StaffCreate):
    hashed_password = get_password_hash(staff.password)
    # Create a dictionary of staff data, excluding the password
    db_staff_data = staff.dict(exclude={"password"})
    db_staff = models.staff.Staff(**db_staff_data, hashed_password=hashed_password)
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

def update_staff(db: Session, staff_id: int, staff: StaffCreate):
    db_staff = db.query(models.staff.Staff).filter(models.staff.Staff.id == staff_id).first()
    if db_staff:
        update_data = staff.dict(exclude_unset=True)
        if 'password' in update_data:
            hashed_password = get_password_hash(update_data['password'])
            db_staff.hashed_password = hashed_password
            del update_data['password']
        
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
    return db.query(models.invoice.Invoice).offset(skip).limit(limit).all()

def create_invoice(db: Session, invoice: InvoiceCreate):
    db_invoice = models.invoice.Invoice(**invoice.dict())
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def update_invoice_status(db: Session, invoice_id: int, status: str):
    db_invoice = db.query(models.invoice.Invoice).filter(models.invoice.Invoice.id == invoice_id).first()
    if db_invoice:
        db_invoice.status = status
        db.commit()
        db.refresh(db_invoice)
    return db_invoice

# Medicine CRUD
def get_medicines(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.medicine.Medicine).offset(skip).limit(limit).all()

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
    return db.query(models.dispensation.Dispensation).offset(skip).limit(limit).all()

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

