import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Box,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import axios from 'axios';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
}

interface Appointment {
  id: number;
  patient_id: number;
  doctor_name: string;
  appointment_date: string; // ISO string
  reason: string;
  status: string;
  patient: Patient;
}

interface EditAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: (appointment: Omit<Appointment, 'patient'>) => void;
  appointment: Appointment;
}

export default function EditAppointmentDialog({ open, onClose, onEdit, appointment }: EditAppointmentDialogProps) {
  const [patientId, setPatientId] = useState<number | ''>('');
  const [doctorName, setDoctorName] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [reason, setReason] = useState<string>('');
  const [status, setStatus] = useState<string>('Scheduled');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState<boolean>(true);

  const API_BASE_URL = 'http://localhost:8000'; // Your FastAPI backend URL

  useEffect(() => {
    if (appointment) {
      setPatientId(appointment.patient_id);
      setDoctorName(appointment.doctor_name);
      setAppointmentDate(new Date(appointment.appointment_date));
      setReason(appointment.reason);
      setStatus(appointment.status);
    }
    if (open) {
      fetchPatients();
    }
  }, [appointment, open]);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await axios.get<Patient[]>(`${API_BASE_URL}/patients/`);
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleSubmit = () => {
    if (patientId && doctorName && appointmentDate && reason && status) {
      onEdit({
        id: appointment.id,
        patient_id: patientId as number,
        doctor_name: doctorName,
        appointment_date: appointmentDate.toISOString(),
        reason,
        status,
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Appointment</DialogTitle>
      <DialogContent>
        {loadingPatients ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
            <CircularProgress />
          </Box>
        ) : (
          <FormControl fullWidth margin="dense">
            <InputLabel id="patient-select-label">Patient</InputLabel>
            <Select
              labelId="patient-select-label"
              value={patientId}
              label="Patient"
              onChange={(e) => setPatientId(e.target.value as number)}
            >
              {patients.map((patient) => (
                <MenuItem key={patient.id} value={patient.id}>
                  {`${patient.first_name} ${patient.last_name}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextField
          margin="dense"
          label="Doctor Name"
          type="text"
          fullWidth
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
        />
        <DateTimePicker
          label="Appointment Date & Time"
          value={appointmentDate}
          onChange={(newValue) => setAppointmentDate(newValue)}
          slotProps={{ textField: { margin: 'dense', fullWidth: true } }}
        />
        <TextField
          margin="dense"
          label="Reason"
          type="text"
          fullWidth
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value as string)}
          >
            <MenuItem value="Scheduled">Scheduled</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
