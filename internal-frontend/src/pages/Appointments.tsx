import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { format } from 'date-fns';
import AddAppointmentDialog from '../components/AddAppointmentDialog';
import EditAppointmentDialog from '../components/EditAppointmentDialog';
import ConfirmationDialog from '../components/ConfirmationDialog';

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
  patient: Patient; // Nested patient object
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const API_BASE_URL = 'http://localhost:8000'; // Your FastAPI backend URL

const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Appointment[]>(`/appointments/`);
      setAppointments(response.data);
    } catch (err) {
      setError('Failed to fetch appointments.');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAddAppointment = async (newAppointmentData: Omit<Appointment, 'id' | 'patient'>) => {
    try {
      await apiClient.post(`/appointments/`, newAppointmentData);
      fetchAppointments(); // Refresh the list
    } catch (err) {
      setError('Failed to add appointment.');
      console.error('Error adding appointment:', err);
    }
  };

  const handleEditAppointment = async (updatedAppointmentData: Omit<Appointment, 'patient'>) => {
    if (!currentAppointment) return;
    try {
      await apiClient.put(`/appointments/${currentAppointment.id}`, updatedAppointmentData);
      fetchAppointments(); // Refresh the list
    } catch (err) {
      setError('Failed to update appointment.');
      console.error('Error updating appointment:', err);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!currentAppointment) return;
    try {
      await apiClient.delete(`/appointments/${currentAppointment.id}`);
      fetchAppointments(); // Refresh the list
    } catch (err) {
      setError('Failed to delete appointment.');
      console.error('Error deleting appointment:', err);
    } finally {
      setIsDeleteDialogOpen(false);
      setCurrentAppointment(null);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, appointment: Appointment) => {
    setAnchorEl(event.currentTarget);
    setCurrentAppointment(appointment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentAppointment(null);
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Appointments
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add Appointment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Patient Name</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.id}</TableCell>
                <TableCell>{`${appointment.patient.first_name} ${appointment.patient.last_name}`}</TableCell>
                <TableCell>{appointment.doctor_name}</TableCell>
                <TableCell>{format(new Date(appointment.appointment_date), 'PPP p')}</TableCell>
                <TableCell>{appointment.reason}</TableCell>
                <TableCell>{appointment.status}</TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label="more"
                    id={`long-button-${appointment.id}`}
                    aria-controls={openMenu ? `long-menu-${appointment.id}` : undefined}
                    aria-expanded={openMenu ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={(event) => handleMenuClick(event, appointment)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id={`long-menu-${appointment.id}`}
                    MenuListProps={{
                      'aria-labelledby': `long-button-${appointment.id}`,
                    }}
                    anchorEl={anchorEl}
                    open={openMenu && currentAppointment?.id === appointment.id}
                    onClose={handleMenuClose}
                    PaperProps={{
                      style: {
                        maxHeight: 48 * 4.5,
                        width: '20ch',
                      },
                    }}
                  >
                    <MenuItem onClick={handleEditClick}>
                      <EditIcon sx={{ mr: 1 }} /> Edit
                    </MenuItem>
                    <MenuItem onClick={handleDeleteClick}>
                      <DeleteIcon sx={{ mr: 1 }} /> Delete
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AddAppointmentDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddAppointment}
      />
      {currentAppointment && (
        <EditAppointmentDialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onEdit={handleEditAppointment}
          appointment={currentAppointment}
        />
      )}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAppointment}
        title="Delete Appointment"
        message={`Are you sure you want to delete the appointment for ${currentAppointment?.patient.first_name} ${currentAppointment?.patient.last_name} with Dr. ${currentAppointment?.doctor_name}?`}
      />
    </Box>
  );
}