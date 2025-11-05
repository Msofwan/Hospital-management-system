import { API_BASE_URL } from './config';
import type {
  AppointmentRequestPayload,
  AppointmentRequestReceipt,
  DoctorProfile,
  DoctorSchedule,
  PatientPortalLoginRequest,
  PatientPortalLoginResponse,
  PatientPortalProfile,
} from '../types/public';

interface DoctorScheduleResponse {
  day_of_week: string;
  start_time: string;
  end_time: string;
  location?: string | null;
  notes?: string | null;
}

interface DoctorResponse {
  id: number;
  first_name: string;
  last_name: string;
  department?: string | null;
  specialization?: string | null;
  employment_type?: string | null;
  schedules: DoctorScheduleResponse[];
  next_available_slots: string[];
}

interface AppointmentRequestApiPayload {
  full_name: string;
  email: string;
  phone_number: string;
  preferred_date: string;
  preferred_time?: string;
  reason?: string;
  preferred_doctor_id?: number | null;
}

export async function fetchDoctors(): Promise<DoctorProfile[]> {
  const response = await fetch(`${API_BASE_URL}/public/doctors`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load doctors');
  }
  const data = (await response.json()) as DoctorResponse[];
  return data.map((doctor) => ({
    id: doctor.id,
    firstName: doctor.first_name,
    lastName: doctor.last_name,
    department: doctor.department ?? null,
    specialization: doctor.specialization ?? null,
    employmentType: doctor.employment_type ?? null,
    schedules: doctor.schedules.map<DoctorSchedule>((schedule) => ({
      dayOfWeek: schedule.day_of_week,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      location: schedule.location ?? null,
      notes: schedule.notes ?? null,
    })),
    nextAvailableSlots: doctor.next_available_slots ?? [],
  }));
}

export async function submitAppointmentRequest(payload: AppointmentRequestPayload): Promise<AppointmentRequestReceipt> {
  const apiPayload: AppointmentRequestApiPayload = {
    full_name: payload.fullName,
    email: payload.email,
    phone_number: payload.phoneNumber,
    preferred_date: payload.preferredDate,
    preferred_time: payload.preferredTime || undefined,
    reason: payload.reason || undefined,
    preferred_doctor_id: payload.preferredDoctorId ?? undefined,
  };

  const response = await fetch(`${API_BASE_URL}/public/appointment-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPayload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(errorBody?.detail ?? 'Unable to submit appointment request');
  }

  const data = (await response.json()) as AppointmentRequestReceipt;
  return data;
}

export async function requestPatientPortalSession(
  payload: PatientPortalLoginRequest,
): Promise<PatientPortalLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/patient-portal/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: payload.email,
      date_of_birth: payload.dateOfBirth,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(errorBody?.detail ?? 'Unable to initiate patient portal session');
  }

  const data = (await response.json()) as { token: string; expires_at: string };
  return {
    token: data.token,
    expiresAt: data.expires_at,
  };
}

export async function fetchPatientPortalProfile(token: string): Promise<PatientPortalProfile> {
  const response = await fetch(`${API_BASE_URL}/patient-portal/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Unable to load patient profile');
  }

  const data = (await response.json()) as {
    patient: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      contact_number: string;
    };
    upcoming_appointments: Array<{
      id: number;
      appointment_date: string;
      reason: string;
      status: string;
      doctor_name?: string | null;
    }>;
    recent_invoices: Array<{
      id: number;
      amount: number;
      status: string;
      date_issued: string;
      due_date?: string | null;
    }>;
  };

  return {
    patient: {
      id: data.patient.id,
      firstName: data.patient.first_name,
      lastName: data.patient.last_name,
      email: data.patient.email,
      contactNumber: data.patient.contact_number,
    },
    upcomingAppointments: data.upcoming_appointments.map((appt) => ({
      id: appt.id,
      appointmentDate: appt.appointment_date,
      reason: appt.reason,
      status: appt.status,
      doctorName: appt.doctor_name ?? null,
    })),
    recentInvoices: data.recent_invoices.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount,
      status: invoice.status,
      dateIssued: invoice.date_issued,
      dueDate: invoice.due_date ?? null,
    })),
  };
}
