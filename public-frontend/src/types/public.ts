export interface DoctorSchedule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  notes?: string | null;
}

export interface DoctorProfile {
  id: number;
  firstName: string;
  lastName: string;
  department?: string | null;
  specialization?: string | null;
  employmentType?: string | null;
  schedules: DoctorSchedule[];
  nextAvailableSlots: string[];
}

export interface AppointmentRequestPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  preferredDate: string;
  preferredTime?: string;
  reason?: string;
  preferredDoctorId?: number | null;
}

export interface AppointmentRequestReceipt {
  id: number;
  status: string;
  message: string;
}

export interface PatientPortalLoginRequest {
  email: string;
  dateOfBirth: string;
}

export interface PatientPortalLoginResponse {
  token: string;
  expiresAt: string;
}

export interface PatientPortalProfile {
  patient: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
  };
  upcomingAppointments: Array<{
    id: number;
    appointmentDate: string;
    reason: string;
    status: string;
    doctorName?: string | null;
  }>;
  recentInvoices: Array<{
    id: number;
    amount: number;
    status: string;
    dateIssued: string;
    dueDate?: string | null;
  }>;
}
