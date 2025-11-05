"""Pydantic schema exports and forward-ref resolution."""

from typing import Dict, Tuple, Type

from pydantic import BaseModel

from .admission import Admission, AdmissionBase, AdmissionCreate, AdmissionSummary, AdmissionUpdate
from .appointment import (
    Appointment,
    AppointmentBase,
    AppointmentCreate,
    AppointmentSummary,
    AppointmentUpdate,
)
from .appointment_request import (
    AppointmentRequest,
    AppointmentRequestApprove,
    AppointmentRequestBase,
    AppointmentRequestCreate,
    AppointmentRequestReceipt,
    AppointmentRequestStatus,
    AppointmentRequestUpdate,
)
from .bed import Bed, BedBase, BedCreate, BedUpdate
from .dispensation import Dispensation, DispensationBase, DispensationCreate
from .doctor_schedule import (
    DoctorSchedule,
    DoctorScheduleBase,
    DoctorScheduleCreate,
    DoctorScheduleUpdate,
)
from .invoice import Invoice, InvoiceBase, InvoiceCreate, InvoiceSummary, InvoiceUpdate
from .lab_result import LabResult, LabResultBase, LabResultCreate, LabResultUpdate
from .medicine import Medicine, MedicineBase, MedicineCreate, MedicineRestock, MedicineUpdate
from .patient import Patient, PatientBase, PatientCreate, PatientUpdate
from .patient_portal import (
    PatientPortalLoginRequest,
    PatientPortalLoginResponse,
    PatientPortalProfile,
)
from .patient_visit import (
    PatientVisit,
    PatientVisitBase,
    PatientVisitCreate,
    PatientVisitSummary,
    PatientVisitUpdate,
)
from .prescription import Prescription, PrescriptionBase, PrescriptionCreate, PrescriptionUpdate
from .public import DoctorPublicProfile, DoctorSchedulePublic
from .role import Role, RoleBase, RoleCreate, RoleUpdate
from .staff import Staff, StaffBase, StaffCreate, StaffSummary, StaffUpdate


MODEL_TYPES: Tuple[Type[BaseModel], ...] = (
    Admission,
    AdmissionBase,
    AdmissionCreate,
    AdmissionSummary,
    AdmissionUpdate,
    Appointment,
    AppointmentBase,
    AppointmentCreate,
    AppointmentSummary,
    AppointmentUpdate,
    AppointmentRequest,
    AppointmentRequestApprove,
    AppointmentRequestBase,
    AppointmentRequestCreate,
    AppointmentRequestReceipt,
    AppointmentRequestUpdate,
    Bed,
    BedBase,
    BedCreate,
    BedUpdate,
    Dispensation,
    DispensationBase,
    DispensationCreate,
    DoctorSchedule,
    DoctorScheduleBase,
    DoctorScheduleCreate,
    DoctorScheduleUpdate,
    DoctorSchedulePublic,
    Invoice,
    InvoiceBase,
    InvoiceCreate,
    InvoiceSummary,
    InvoiceUpdate,
    LabResult,
    LabResultBase,
    LabResultCreate,
    LabResultUpdate,
    Medicine,
    MedicineBase,
    MedicineCreate,
    MedicineRestock,
    MedicineUpdate,
    Patient,
    PatientBase,
    PatientCreate,
    PatientPortalLoginRequest,
    PatientPortalLoginResponse,
    PatientPortalProfile,
    PatientUpdate,
    PatientVisit,
    PatientVisitBase,
    PatientVisitCreate,
    PatientVisitSummary,
    PatientVisitUpdate,
    Prescription,
    PrescriptionBase,
    PrescriptionCreate,
    PrescriptionUpdate,
    DoctorPublicProfile,
    RoleBase,
    Role,
    RoleCreate,
    RoleUpdate,
    Staff,
    StaffBase,
    StaffCreate,
    StaffSummary,
    StaffUpdate,
)


def _rebuild_forward_refs() -> None:
    """Ensure all Pydantic models resolve cross-module forward references."""

    models_needing_rebuild: Dict[str, Type[BaseModel]] = {
        model.__name__: model for model in MODEL_TYPES
    }

    for model in models_needing_rebuild.values():
        rebuild = getattr(model, "model_rebuild", None)
        if callable(rebuild):
            rebuild(force=True, _types_namespace=models_needing_rebuild)
            continue

        update_refs = getattr(model, "update_forward_refs", None)
        if callable(update_refs):
            update_refs(**models_needing_rebuild)


_rebuild_forward_refs()


__all__ = [
    "Admission",
    "AdmissionBase",
    "AdmissionCreate",
    "AdmissionSummary",
    "AdmissionUpdate",
    "Appointment",
    "AppointmentBase",
    "AppointmentCreate",
    "AppointmentSummary",
    "AppointmentUpdate",
    "AppointmentRequest",
    "AppointmentRequestApprove",
    "AppointmentRequestBase",
    "AppointmentRequestCreate",
    "AppointmentRequestReceipt",
    "AppointmentRequestStatus",
    "AppointmentRequestUpdate",
    "Bed",
    "BedBase",
    "BedCreate",
    "BedUpdate",
    "Dispensation",
    "DispensationBase",
    "DispensationCreate",
    "DoctorSchedule",
    "DoctorScheduleBase",
    "DoctorScheduleCreate",
    "DoctorScheduleUpdate",
    "DoctorSchedulePublic",
    "Invoice",
    "InvoiceBase",
    "InvoiceCreate",
    "InvoiceSummary",
    "InvoiceUpdate",
    "LabResult",
    "LabResultBase",
    "LabResultCreate",
    "LabResultUpdate",
    "Medicine",
    "MedicineBase",
    "MedicineCreate",
    "MedicineRestock",
    "MedicineUpdate",
    "Patient",
    "PatientBase",
    "PatientCreate",
    "PatientPortalLoginRequest",
    "PatientPortalLoginResponse",
    "PatientPortalProfile",
    "PatientUpdate",
    "PatientVisit",
    "PatientVisitBase",
    "PatientVisitCreate",
    "PatientVisitSummary",
    "PatientVisitUpdate",
    "Prescription",
    "PrescriptionBase",
    "PrescriptionCreate",
    "PrescriptionUpdate",
    "DoctorPublicProfile",
    "RoleBase",
    "Role",
    "RoleCreate",
    "RoleUpdate",
    "Staff",
    "StaffBase",
    "StaffCreate",
    "StaffSummary",
    "StaffUpdate",
]
