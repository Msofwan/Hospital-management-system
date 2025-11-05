import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import apiClient from '../api/client';
import type { AppointmentPayload, Patient, StaffSummary } from '../types/hms';

interface AddAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (appointment: AppointmentPayload) => void;
}

export default function AddAppointmentDialog({ open, onClose, onAdd }: AddAppointmentDialogProps) {
  const [patientId, setPatientId] = useState<number | ''>('');
  const [providerId, setProviderId] = useState<number | ''>('');
  const [doctorName, setDoctorName] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(new Date());
  const [reason, setReason] = useState<string>('');
  const [status, setStatus] = useState<string>('Scheduled');
  const [location, setLocation] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<StaffSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      resetForm();
      loadSupportingData();
    }
  }, [open]);

  useEffect(() => {
    if (!providerId) return;
    const selected = doctors.find((doctor) => doctor.id === providerId);
    if (selected) {
      setDoctorName(`${selected.first_name} ${selected.last_name}`.trim());
    }
  }, [providerId, doctors]);

  const resetForm = () => {
    setPatientId('');
    setProviderId('');
    setDoctorName('');
    setAppointmentDate(new Date());
    setReason('');
    setStatus('Scheduled');
    setLocation('');
    setAppointmentType('');
  };

  const loadSupportingData = async () => {
    try {
      setLoading(true);
      const [patientsResponse, staffResponse] = await Promise.all([
        apiClient.get<Patient[]>('/patients/'),
        apiClient.get<StaffSummary[]>('/staff/'),
      ]);
      setPatients(patientsResponse.data);
      setDoctors(staffResponse.data.filter((staff) => staff.role?.name === 'Doctor'));
    } catch (error) {
      console.error('Failed to fetch supporting data for appointment', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!patientId || !appointmentDate || !reason || !status) return;
    const payload: AppointmentPayload = {
      patient_id: patientId,
      provider_id: providerId || undefined,
      doctor_name: doctorName || undefined,
      appointment_date: appointmentDate.toISOString(),
      reason,
      status,
      location: location || undefined,
      appointment_type: appointmentType || undefined,
    };
    onAdd(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Appointment</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <FormControl fullWidth margin="dense">
              <InputLabel id="patient-select-label">Patient</InputLabel>
              <Select
                labelId="patient-select-label"
                value={patientId}
                label="Patient"
                onChange={(event) => setPatientId(event.target.value as number)}
              >
                <MenuItem value="" disabled>
                  Select patient
                </MenuItem>
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel id="provider-select-label">Provider</InputLabel>
              <Select
                labelId="provider-select-label"
                value={providerId}
                label="Provider"
                onChange={(event) => setProviderId(event.target.value as number)}
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.first_name} {doctor.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="dense"
              label="Doctor Name (optional)"
              type="text"
              fullWidth
              value={doctorName}
              onChange={(event) => setDoctorName(event.target.value)}
            />

            <DateTimePicker
              label="Appointment Date & Time"
              value={appointmentDate}
              onChange={(value) => setAppointmentDate(value)}
              slotProps={{ textField: { margin: 'dense', fullWidth: true } }}
            />

            <TextField
              margin="dense"
              label="Reason"
              type="text"
              fullWidth
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />

            <TextField
              margin="dense"
              label="Location"
              type="text"
              fullWidth
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />

            <TextField
              margin="dense"
              label="Appointment Type"
              type="text"
              fullWidth
              value={appointmentType}
              onChange={(event) => setAppointmentType(event.target.value)}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={status}
                label="Status"
                onChange={(event) => setStatus(event.target.value as string)}
              >
                <MenuItem value="Scheduled">Scheduled</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!patientId || !appointmentDate || !reason}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
