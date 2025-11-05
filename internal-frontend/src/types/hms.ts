export interface StaffSummary {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  department?: string | null;
  specialization?: string | null;
  license_number?: string | null;
  employment_type?: string | null;
}

export interface Staff extends StaffSummary {
  contact_number: string;
  schedules: DoctorSchedule[];
}

export interface StaffFormPayload {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  password?: string;
  role_id: number;
  department?: string | null;
  specialization?: string | null;
  license_number?: string | null;
  employment_type?: string | null;
}

export interface Role {
  id: number;
  name: string;
  description?: string | null;
}

export interface AppointmentSummary {
  id: number;
  appointment_date: string;
  reason: string;
  status: string;
  doctor_name?: string | null;
}

export interface AppointmentDetail {
  id: number;
  patient_id: number;
  provider_id?: number | null;
  doctor_name?: string | null;
  appointment_date: string;
  reason: string;
  status: string;
  location?: string | null;
  appointment_type?: string | null;
  patient: Patient;
  provider?: StaffSummary | null;
}

export interface AppointmentPayload {
  patient_id: number;
  provider_id?: number | null;
  doctor_name?: string | null;
  appointment_date: string;
  reason: string;
  status: string;
  location?: string | null;
  appointment_type?: string | null;
}

export interface Prescription {
  id: number;
  visit_id: number;
  medicine_name: string;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  instructions?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface LabResult {
  id: number;
  visit_id: number;
  test_name: string;
  result_value?: string | null;
  unit?: string | null;
  normal_range?: string | null;
  result_date: string;
  notes?: string | null;
}

export interface PatientVisit {
  id: number;
  patient_id: number;
  provider_id: number;
  appointment_id?: number | null;
  visit_date: string;
  chief_complaint?: string | null;
  diagnosis?: string | null;
  allergies?: string | null;
  treatment_plan?: string | null;
  notes?: string | null;
  provider: StaffSummary;
  prescriptions: Prescription[];
  lab_results: LabResult[];
}

export interface BedSummary {
  id: number;
  bed_number: string;
  room_number: string;
}

export interface AdmissionSummary {
  id: number;
  patient_id: number;
  bed_id?: number | null;
  attending_staff_id?: number | null;
  reason?: string | null;
  status: string;
  admitted_at: string;
  discharged_at?: string | null;
  discharge_summary?: string | null;
  bed?: BedSummary | null;
  attending_provider?: StaffSummary | null;
}

export interface InvoiceSummary {
  id: number;
  patient_id: number;
  amount: number;
  description: string;
  status: string;
  date_issued: string;
  due_date?: string | null;
  insurance_provider?: string | null;
  insurance_policy_number?: string | null;
  insurance_claim_number?: string | null;
  insurance_status?: string | null;
}

export interface InvoiceDetail extends InvoiceSummary {
  patient: Patient;
}

export interface InvoicePayload {
  patient_id: number;
  amount: number;
  description: string;
  status?: string;
  date_issued?: string;
  due_date?: string | null;
  insurance_provider?: string | null;
  insurance_policy_number?: string | null;
  insurance_claim_number?: string | null;
  insurance_status?: string | null;
}

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  contact_number: string;
  email: string;
  bpjs_number?: string | null;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_number?: string | null;
  insurance_provider?: string | null;
  insurance_policy_number?: string | null;
  appointments: AppointmentSummary[];
  visits: PatientVisit[];
  admissions: AdmissionSummary[];
  invoices: InvoiceSummary[];
}

export interface Medicine {
  id: number;
  name: string;
  manufacturer: string;
  stock_quantity: number;
  unit_price: number;
}

export interface Bed {
  id: number;
  bed_number: string;
  room_number: string;
  is_occupied: boolean;
  patient_id?: number | null;
  patient?: Patient | null;
  admissions?: AdmissionSummary[];
}

export interface DoctorSchedule {
  id: number;
  staff_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location?: string | null;
  notes?: string | null;
  provider: StaffSummary;
}

export type AppointmentRequestStatus = 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'Completed';

export interface AppointmentRequest {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  preferred_date: string;
  preferred_time?: string | null;
  reason?: string | null;
  preferred_doctor_id?: number | null;
  status: AppointmentRequestStatus;
  decision_notes?: string | null;
  handled_by_staff?: StaffSummary | null;
  preferred_doctor?: StaffSummary | null;
  converted_appointment_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentRequestUpdatePayload {
  status?: AppointmentRequestStatus;
  decision_notes?: string | null;
}

export interface AppointmentRequestApprovalPayload {
  patient_id: number;
  provider_id?: number | null;
  doctor_name?: string | null;
  appointment_date: string;
  reason: string;
  status?: string;
  location?: string | null;
  appointment_type?: string | null;
  decision_notes?: string | null;
}
