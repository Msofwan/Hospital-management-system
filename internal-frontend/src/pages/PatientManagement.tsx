import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format } from 'date-fns';

import apiClient from '../api/client';
import AddPatientDialog from '../components/AddPatientDialog';
import ConfirmationDialog from '../components/ConfirmationDialog';
import EditPatientDialog from '../components/EditPatientDialog';
import PatientDetailsDialog from '../components/PatientDetailsDialog';
import type { Patient } from '../types/hms';

export default function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Patient[]>('/patients/');
      setPatients(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch patients', err);
      setError('Failed to fetch patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      const refreshed = patients.find((p) => p.id === selectedPatient.id);
      if (refreshed) {
        setSelectedPatient(refreshed);
      }
    }
  }, [patients, selectedPatient]);

  const handleAddPatient = async (patientPayload: Record<string, unknown>) => {
    try {
      await apiClient.post('/patients/', patientPayload);
      setAddDialogOpen(false);
      fetchPatients();
    } catch (err) {
      console.error('Failed to add patient', err);
    }
  };

  const handleEditPatient = async (patientPayload: Record<string, unknown>) => {
    if (!selectedPatient) return;
    try {
      await apiClient.put(`/patients/${selectedPatient.id}`, patientPayload);
      setEditDialogOpen(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (err) {
      console.error('Failed to update patient', err);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, patient: Patient) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPatient) return;
    try {
      await apiClient.delete(`/patients/${selectedPatient.id}`);
      setConfirmDialogOpen(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (err) {
      console.error('Failed to delete patient', err);
    }
  };

  const formattedPatients = useMemo(() => patients, [patients]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Patient Management
        </Typography>
        <Button variant="contained" onClick={() => setAddDialogOpen(true)}>
          Add Patient
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading patients...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>BPJS</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Insurance</TableCell>
                <TableCell>Upcoming Appts</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formattedPatients.map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>{patient.id}</TableCell>
                  <TableCell>{`${patient.first_name} ${patient.last_name}`}</TableCell>
                  <TableCell>{patient.bpjs_number ?? '—'}</TableCell>
                  <TableCell>{patient.contact_number}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.insurance_provider ?? '—'}</TableCell>
                  <TableCell>
                    {patient.appointments.length === 0 ? (
                      <Chip size="small" label="No upcoming" />
                    ) : (
                      <Chip
                        size="small"
                        color="primary"
                        label={format(new Date(patient.appointments[0].appointment_date), 'MMM d, yyyy p')}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      aria-label={`View patient record for ${patient.first_name} ${patient.last_name}`}
                      onClick={() => { setSelectedPatient(patient); setDetailsOpen(true); }}
                    >
                      <InfoIcon />
                    </IconButton>
                    <IconButton
                      aria-label={`More actions for patient ${patient.first_name} ${patient.last_name}`}
                      id={`patient-actions-${patient.id}`}
                      aria-controls={anchorEl && selectedPatient?.id === patient.id ? `patient-menu-${patient.id}` : undefined}
                      aria-haspopup="true"
                      aria-expanded={anchorEl && selectedPatient?.id === patient.id ? 'true' : undefined}
                      onClick={(event) => handleMenuClick(event, patient)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        id={selectedPatient ? `patient-menu-${selectedPatient.id}` : undefined}
        MenuListProps={selectedPatient ? { 'aria-labelledby': `patient-actions-${selectedPatient.id}` } : undefined}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setEditDialogOpen(true);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setConfirmDialogOpen(true);
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <AddPatientDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} onAddPatient={handleAddPatient} />
      <EditPatientDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onEditPatient={handleEditPatient}
        patient={selectedPatient}
      />
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient"
        message={`Are you sure you want to delete ${selectedPatient?.first_name} ${selectedPatient?.last_name}?`}
      />
      <PatientDetailsDialog
        open={detailsOpen}
        patient={selectedPatient}
        onClose={() => setDetailsOpen(false)}
        onRefresh={fetchPatients}
      />
    </Box>
  );
}