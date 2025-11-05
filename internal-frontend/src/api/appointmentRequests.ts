import apiClient from './client';
import type {
  AppointmentRequest,
  AppointmentRequestApprovalPayload,
  AppointmentRequestUpdatePayload,
} from '../types/hms';

export async function fetchAppointmentRequests(status?: string): Promise<AppointmentRequest[]> {
  const response = await apiClient.get<AppointmentRequest[]>('/appointment-requests', {
    params: status ? { status } : undefined,
  });
  return response.data;
}

export async function updateAppointmentRequest(
  requestId: number,
  payload: AppointmentRequestUpdatePayload,
): Promise<AppointmentRequest> {
  const response = await apiClient.put<AppointmentRequest>(`/appointment-requests/${requestId}`, payload);
  return response.data;
}

export async function approveAppointmentRequest(
  requestId: number,
  payload: AppointmentRequestApprovalPayload,
): Promise<AppointmentRequest> {
  const response = await apiClient.post<AppointmentRequest>(
    `/appointment-requests/${requestId}/approve`,
    payload,
  );
  return response.data;
}
