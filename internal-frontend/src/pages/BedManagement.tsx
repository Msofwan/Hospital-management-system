import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Grid,
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
} from '@mui/material';
import { Hotel, Accessible } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
}

interface Bed {
  id: number;
  bed_number: string;
  room_number: string;
  is_occupied: boolean;
  patient_id: number | null;
  patient: Patient | null;
}

const API_BASE_URL = 'http://localhost:8000';

export default function BedManagement() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddBedDialogOpen, setIsAddBedDialogOpen] = useState<boolean>(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState<boolean>(false);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Bed[]>(`${API_BASE_URL}/beds/`);
      setBeds(response.data);
    } catch (err) {
      setError('Failed to fetch beds.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get<Patient[]>(`${API_BASE_URL}/patients/`);
      // Filter out patients who are already in a bed
      const assignedPatientIds = beds.map(b => b.patient_id).filter(id => id !== null);
      const unassignedPatients = response.data.filter(p => !assignedPatientIds.includes(p.id));
      setPatients(unassignedPatients);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    }
  };

  useEffect(() => {
    fetchBeds();
  }, []);

  useEffect(() => {
    if (isAssignDialogOpen) {
      fetchPatients();
    }
  }, [isAssignDialogOpen, beds]);

  const handleAddBed = async (bedData: { room_number: string; bed_number: string }) => {
    try {
      await axios.post(`${API_BASE_URL}/beds/`, bedData);
      fetchBeds();
      setIsAddBedDialogOpen(false);
    } catch (err) {
      console.error('Failed to add bed', err);
    }
  };

  const handleAssignPatient = async () => {
    if (!selectedBed || !selectedPatientId) return;
    try {
      await axios.put(`${API_BASE_URL}/beds/${selectedBed.id}`, {
        is_occupied: true,
        patient_id: selectedPatientId,
      });
      fetchBeds();
      setIsAssignDialogOpen(false);
      setSelectedBed(null);
      setSelectedPatientId('');
    } catch (err) {
      console.error('Failed to assign patient', err);
    }
  };

  const handleDischarge = async (bed: Bed) => {
    if (!bed.patient_id) return;
    try {
      await axios.put(`${API_BASE_URL}/beds/${bed.id}`, {
        is_occupied: false,
        patient_id: null,
      });
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
          <Grid item key={bed.id} xs={12} sm={6} md={4} lg={3}>
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
                  <Typography sx={{ mt: 2 }}>
                    Patient: {bed.patient.first_name} {bed.patient.last_name}
                  </Typography>
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
      <Dialog open={isAssignDialogOpen} onClose={() => { setIsAssignDialogOpen(false); setSelectedBed(null); }}>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setIsAssignDialogOpen(false); setSelectedBed(null); }}>Cancel</Button>
          <Button onClick={handleAssignPatient} variant="contained">Assign</Button>
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