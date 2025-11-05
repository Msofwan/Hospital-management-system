import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';
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
import { format } from 'date-fns';

import apiClient from '../api/client';
import AddAppointmentDialog from '../components/AddAppointmentDialog';
import EditAppointmentDialog from '../components/EditAppointmentDialog';
import ConfirmationDialog from '../components/ConfirmationDialog';
import type { AppointmentDetail, AppointmentPayload } from '../types/hms';

export default function Appointments() {
  const [appointments, setAppointments] = useState<AppointmentDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentAppointment, setCurrentAppointment] = useState<AppointmentDetail | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const doctorLabelFor = (appointment?: AppointmentDetail | null) => {
    if (!appointment) return 'assigned provider';
    const label = appointment.doctor_name?.trim();
    if (label) return label;
    if (appointment.provider) {
      return `${appointment.provider.first_name} ${appointment.provider.last_name}`;
    }
    return 'assigned provider';
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<AppointmentDetail[]>(`/appointments/`);
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

  const handleAddAppointment = async (newAppointmentData: AppointmentPayload) => {
    try {
      await apiClient.post(`/appointments/`, newAppointmentData);
      fetchAppointments(); // Refresh the list
    } catch (err) {
      setError('Failed to add appointment.');
      console.error('Error adding appointment:', err);
    }
  };

  const handleEditAppointment = async (updatedAppointmentData: AppointmentPayload) => {
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

  const handleMenuClick = (event: MouseEvent<HTMLElement>, appointment: AppointmentDetail) => {
    setAnchorEl(event.currentTarget);
    setCurrentAppointment(appointment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
            {appointments.map((appointment) => {
              const doctorLabel = appointment.doctor_name?.trim()
                || (appointment.provider ? `${appointment.provider.first_name} ${appointment.provider.last_name}` : '—');
              return (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.id}</TableCell>
                  <TableCell>{`${appointment.patient.first_name} ${appointment.patient.last_name}`}</TableCell>
                  <TableCell>{doctorLabel}</TableCell>
                  <TableCell>{format(new Date(appointment.appointment_date), 'PPP p')}</TableCell>
                  <TableCell>{appointment.reason}</TableCell>
                  <TableCell>{appointment.status}</TableCell>
                  <TableCell align="right">
                  <IconButton
                    aria-label={`Manage options for appointment ${appointment.id}`}
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
              );
            })}
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
          onClose={() => {
            setIsEditDialogOpen(false);
            setCurrentAppointment(null);
          }}
          onEdit={handleEditAppointment}
          appointment={currentAppointment}
        />
      )}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCurrentAppointment(null);
        }}
        onConfirm={handleDeleteAppointment}
        title="Delete Appointment"
        message={`Are you sure you want to delete the appointment for ${currentAppointment?.patient.first_name} ${currentAppointment?.patient.last_name} with ${doctorLabelFor(currentAppointment)}?`}
      />
    </Box>
  );
}