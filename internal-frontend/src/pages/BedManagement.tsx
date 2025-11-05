import { useCallback, useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Hotel, Accessible } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';

import apiClient from '../api/client';
import type { Bed, Patient, StaffSummary } from '../types/hms';

export default function BedManagement() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddBedDialogOpen, setIsAddBedDialogOpen] = useState<boolean>(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState<boolean>(false);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<StaffSummary[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | ''>('');
  const [admissionReason, setAdmissionReason] = useState<string>('');

  const fetchBeds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Bed[]>(`/beds/`);
      setBeds(response.data);
    } catch (err) {
      setError('Failed to fetch beds.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const [patientsResponse, staffResponse] = await Promise.all([
        apiClient.get<Patient[]>(`/patients/`),
        apiClient.get<StaffSummary[]>(`/staff/`),
      ]);
      const assignedPatientIds = beds
        .map((b) => (b.is_occupied ? b.patient_id : null))
        .filter((id): id is number => id !== null);
      const unassignedPatients = patientsResponse.data.filter((p) => !assignedPatientIds.includes(p.id));
      setPatients(unassignedPatients);
      setDoctors(staffResponse.data.filter((staff) => staff.role?.name === 'Doctor'));
    } catch (err) {
      console.error('Failed to fetch patients', err);
    }
  }, [beds]);

  useEffect(() => {
    fetchBeds();
  }, [fetchBeds]);

  useEffect(() => {
    if (isAssignDialogOpen) {
      fetchPatients();
    }
  }, [isAssignDialogOpen, fetchPatients]);

  const handleAddBed = async (bedData: { room_number: string; bed_number: string }) => {
    try {
      await apiClient.post(`/beds/`, bedData);
      fetchBeds();
      setIsAddBedDialogOpen(false);
    } catch (err) {
      console.error('Failed to add bed', err);
    }
  };

  const handleAssignPatient = async () => {
    if (!selectedBed || !selectedPatientId) return;
    try {
      await apiClient.post('/admissions/', {
        patient_id: selectedPatientId,
        bed_id: selectedBed.id,
        attending_staff_id: selectedDoctorId || undefined,
        reason: admissionReason || undefined,
        admitted_at: new Date().toISOString(),
        status: 'Admitted',
      });
      fetchBeds();
      setIsAssignDialogOpen(false);
      setSelectedBed(null);
      setSelectedPatientId('');
      setSelectedDoctorId('');
      setAdmissionReason('');
    } catch (err) {
      console.error('Failed to assign patient', err);
    }
  };

  const handleDischarge = async (bed: Bed) => {
    if (!bed.patient_id) return;
    try {
      const activeAdmission = bed.admissions?.find((admission) => admission.status !== 'Discharged');
      if (activeAdmission) {
        await apiClient.put(`/admissions/${activeAdmission.id}`, {
          status: 'Discharged',
          discharged_at: new Date().toISOString(),
        });
      } else {
        await apiClient.put(`/beds/${bed.id}`, {
          is_occupied: false,
          patient_id: null,
        });
      }
      fetchBeds();
    } catch (err) {
      console.error('Failed to discharge patient', err);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }

  if (error) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><Typography color="error">{error}</Typography></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">Bed Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddBedDialogOpen(true)}>Add Bed</Button>
      </Box>

      <Grid container spacing={3}>
        {beds.map((bed) => (
          <Grid key={bed.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card sx={{ backgroundColor: bed.is_occupied ? '#fff0f0' : '#f0fff0' }}>
              <CardContent>
                <Typography variant="h6" component="div">Room {bed.room_number} - Bed {bed.bed_number}</Typography>
                <Chip
                  icon={bed.is_occupied ? <Accessible /> : <Hotel />}
                  label={bed.is_occupied ? 'Occupied' : 'Vacant'}
                  color={bed.is_occupied ? 'error' : 'success'}
                  size="small"
                  sx={{ mt: 1 }}
                />
                {bed.is_occupied && bed.patient && (
                  <Stack spacing={0.5} sx={{ mt: 2 }}>
                    <Typography>Patient: {bed.patient.first_name} {bed.patient.last_name}</Typography>
                    {bed.admissions?.length ? (
                      (() => {
                        const activeAdmission = bed.admissions.find((admission) => admission.status !== 'Discharged');
                        if (!activeAdmission) return null;
                        return (
                          <Typography variant="body2">
                            Admitted: {new Date(activeAdmission.admitted_at).toLocaleString()}
                            {activeAdmission.attending_provider ? ` · Attending: ${activeAdmission.attending_provider.first_name} ${activeAdmission.attending_provider.last_name}` : ''}
                          </Typography>
                        );
                      })()
                    ) : null}
                  </Stack>
                )}
              </CardContent>
              <CardActions>
                {bed.is_occupied ? (
                  <Button size="small" color="secondary" onClick={() => handleDischarge(bed)}>Discharge</Button>
                ) : (
                  <Button size="small" onClick={() => { setSelectedBed(bed); setIsAssignDialogOpen(true); }}>Assign Patient</Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Bed Dialog */}
      <AddBedDialog open={isAddBedDialogOpen} onClose={() => setIsAddBedDialogOpen(false)} onAdd={handleAddBed} />

      {/* Assign Patient Dialog */}
      <Dialog open={isAssignDialogOpen} onClose={() => { setIsAssignDialogOpen(false); setSelectedBed(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Patient to Bed</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="patient-select-label">Patient</InputLabel>
            <Select
              labelId="patient-select-label"
              value={selectedPatientId}
              label="Patient"
              onChange={(e) => setSelectedPatientId(e.target.value as number)}
            >
              {patients.map((patient) => (
                <MenuItem key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="doctor-select-label">Attending Doctor</InputLabel>
            <Select
              labelId="doctor-select-label"
              value={selectedDoctorId}
              label="Attending Doctor"
              onChange={(e) => setSelectedDoctorId(e.target.value as number)}
            >
              <MenuItem value="">
                <em>Not assigned</em>
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
            label="Admission Reason"
            fullWidth
            value={admissionReason}
            onChange={(e) => setAdmissionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setIsAssignDialogOpen(false); setSelectedBed(null); }}>Cancel</Button>
          <Button onClick={handleAssignPatient} variant="contained" disabled={!selectedPatientId}>Assign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// AddBedDialog Component
interface AddBedDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (bedData: { room_number: string; bed_number: string }) => void;
}

function AddBedDialog({ open, onClose, onAdd }: AddBedDialogProps) {
  const [roomNumber, setRoomNumber] = useState('');
  const [bedNumber, setBedNumber] = useState('');

  const handleSubmit = () => {
    if (roomNumber && bedNumber) {
      onAdd({ room_number: roomNumber, bed_number: bedNumber });
      setRoomNumber('');
      setBedNumber('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Bed</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="Room Number" type="text" fullWidth value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
        <TextField margin="dense" label="Bed Number" type="text" fullWidth value={bedNumber} onChange={(e) => setBedNumber(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Add</Button>
      </DialogActions>
    </Dialog>
  );
}