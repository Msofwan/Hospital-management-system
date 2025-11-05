import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import apiClient from '../api/client';
import ConfirmationDialog from '../components/ConfirmationDialog';
import type { DoctorSchedule, StaffSummary } from '../types/hms';

interface ScheduleFormState {
  staff_id: number | '';
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string;
}

const initialForm: ScheduleFormState = {
  staff_id: '',
  day_of_week: '',
  start_time: '08:00',
  end_time: '16:00',
  location: '',
  notes: '',
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorSchedules() {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [doctors, setDoctors] = useState<StaffSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<ScheduleFormState>(initialForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DoctorSchedule | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<DoctorSchedule | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const menuOpen = Boolean(anchorEl);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scheduleResponse, staffResponse] = await Promise.all([
        apiClient.get<DoctorSchedule[]>('/doctor-schedules/'),
        apiClient.get<StaffSummary[]>('/staff/'),
      ]);
      setSchedules(scheduleResponse.data);
      setDoctors(staffResponse.data.filter((staff) => staff.role?.name === 'Doctor'));
      setError(null);
    } catch (err) {
      console.error('Failed to load schedules', err);
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenForm = (schedule?: DoctorSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormState({
        staff_id: schedule.staff_id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time.slice(0, 5),
        end_time: schedule.end_time.slice(0, 5),
        location: schedule.location ?? '',
        notes: schedule.notes ?? '',
      });
    } else {
      setEditingSchedule(null);
      setFormState(initialForm);
    }
    setIsDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsDialogOpen(false);
    setEditingSchedule(null);
    setFormState(initialForm);
  };

  const handleSubmit = async () => {
    if (!formState.staff_id || !formState.day_of_week || !formState.start_time || !formState.end_time) return;

    const payload = {
      staff_id: formState.staff_id,
      day_of_week: formState.day_of_week,
      start_time: `${formState.start_time}:00`,
      end_time: `${formState.end_time}:00`,
      location: formState.location || undefined,
      notes: formState.notes || undefined,
    };

    try {
      if (editingSchedule) {
        await apiClient.put(`/doctor-schedules/${editingSchedule.id}`, payload);
      } else {
        await apiClient.post('/doctor-schedules/', payload);
      }
      handleCloseForm();
      fetchData();
    } catch (err) {
      console.error('Failed to save doctor schedule', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedSchedule) return;
    try {
      await apiClient.delete(`/doctor-schedules/${selectedSchedule.id}`);
      setConfirmOpen(false);
      setSelectedSchedule(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete schedule', err);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, schedule: DoctorSchedule) => {
    setAnchorEl(event.currentTarget);
    setSelectedSchedule(schedule);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const enhancedSchedules = useMemo(() => schedules, [schedules]);

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Doctor Schedules</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Add Schedule
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading schedules...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Day</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enhancedSchedules.map((schedule) => (
                <TableRow key={schedule.id} hover>
                  <TableCell>{schedule.provider.first_name} {schedule.provider.last_name}</TableCell>
                  <TableCell>{schedule.day_of_week}</TableCell>
                  <TableCell>{schedule.start_time.slice(0, 5)}</TableCell>
                  <TableCell>{schedule.end_time.slice(0, 5)}</TableCell>
                  <TableCell>{schedule.location ?? '—'}</TableCell>
                  <TableCell>{schedule.notes ?? '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label={`Manage options for schedule ${schedule.id}`}
                      id={`schedule-actions-${schedule.id}`}
                      aria-controls={menuOpen && selectedSchedule?.id === schedule.id ? `schedule-menu-${schedule.id}` : undefined}
                      aria-haspopup="true"
                      aria-expanded={menuOpen && selectedSchedule?.id === schedule.id ? 'true' : undefined}
                      onClick={(event) => handleMenuClick(event, schedule)}
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
        open={menuOpen}
        onClose={handleMenuClose}
        id={selectedSchedule ? `schedule-menu-${selectedSchedule.id}` : undefined}
        MenuListProps={selectedSchedule ? { 'aria-labelledby': `schedule-actions-${selectedSchedule.id}` } : undefined}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            if (selectedSchedule) {
              handleOpenForm(selectedSchedule);
            }
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setConfirmOpen(true);
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedSchedule(null);
        }}
        onConfirm={handleDelete}
        title="Delete Schedule"
        message={`Are you sure you want to delete this schedule for ${selectedSchedule?.provider.first_name} ${selectedSchedule?.provider.last_name}?`}
      />

      <Dialog open={isDialogOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="normal">
            <InputLabel id="doctor-select-label">Doctor</InputLabel>
            <Select
              labelId="doctor-select-label"
              value={formState.staff_id}
              label="Doctor"
              onChange={(event) => setFormState((prev) => ({ ...prev, staff_id: event.target.value as number }))}
            >
              <MenuItem value="" disabled>
                Select doctor
              </MenuItem>
              {doctors.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {doctor.first_name} {doctor.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="day-select-label">Day of week</InputLabel>
            <Select
              labelId="day-select-label"
              value={formState.day_of_week}
              label="Day of week"
              onChange={(event) => setFormState((prev) => ({ ...prev, day_of_week: event.target.value as string }))}
            >
              <MenuItem value="" disabled>
                Select day
              </MenuItem>
              {daysOfWeek.map((day) => (
                <MenuItem key={day} value={day}>
                  {day}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Start time"
              type="time"
              fullWidth
              value={formState.start_time}
              onChange={(event) => setFormState((prev) => ({ ...prev, start_time: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End time"
              type="time"
              fullWidth
              value={formState.end_time}
              onChange={(event) => setFormState((prev) => ({ ...prev, end_time: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <TextField
            label="Location"
            fullWidth
            margin="normal"
            value={formState.location}
            onChange={(event) => setFormState((prev) => ({ ...prev, location: event.target.value }))}
          />

          <TextField
            label="Notes"
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            value={formState.notes}
            onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formState.staff_id || !formState.day_of_week || !formState.start_time || !formState.end_time}
          >
            {editingSchedule ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
