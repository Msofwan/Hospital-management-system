import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  Paper,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format } from 'date-fns';

import apiClient from '../api/client';
import {
  approveAppointmentRequest,
  fetchAppointmentRequests,
  updateAppointmentRequest,
} from '../api/appointmentRequests';
import type {
  AppointmentRequest,
  AppointmentRequestApprovalPayload,
  AppointmentRequestStatus,
  AppointmentRequestUpdatePayload,
  Patient,
  Staff,
} from '../types/hms';

type StatusFilter = AppointmentRequestStatus | 'All';

const STATUS_OPTIONS: StatusFilter[] = ['Pending', 'In Review', 'Approved', 'Rejected', 'Completed'];

interface ApproveDialogState {
  patientId: number | '';
  providerId: number | '';
  appointmentDate: Date | null;
  reason: string;
  location: string;
  appointmentType: string;
  decisionNotes: string;
  status: string;
}

const INITIAL_APPROVE_STATE: ApproveDialogState = {
  patientId: '',
  providerId: '',
  appointmentDate: null,
  reason: '',
  location: '',
  appointmentType: 'Consultation',
  decisionNotes: '',
  status: 'Scheduled',
};

export default function AppointmentRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Pending');
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [detailRequest, setDetailRequest] = useState<AppointmentRequest | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [approveState, setApproveState] = useState<ApproveDialogState>(INITIAL_APPROVE_STATE);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [providers, setProviders] = useState<Staff[]>([]);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const fetchReferenceData = async () => {
    try {
      const [patientsResponse, staffResponse] = await Promise.all([
        apiClient.get<Patient[]>('/patients/?limit=1000'),
        apiClient.get<Staff[]>('/staff/?limit=500'),
      ]);
      setPatients(patientsResponse.data);
      const doctorStaff = staffResponse.data.filter((staffMember) => staffMember.role?.name === 'Doctor');
      setProviders(doctorStaff);
    } catch (err) {
      console.error('Failed to fetch reference data', err);
    }
  };

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAppointmentRequests(statusFilter === 'All' ? undefined : statusFilter);
      setRequests(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load appointment requests', err);
      setError('Unable to load appointment requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const openApproveDialog = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setApproveState({
      patientId: '',
      providerId: request.preferred_doctor_id ?? request.preferred_doctor?.id ?? '',
      appointmentDate: request.preferred_date ? new Date(request.preferred_date) : null,
      reason: request.reason ?? 'Consultation',
      location: 'Outpatient Clinic',
      appointmentType: 'Consultation',
      decisionNotes: '',
      status: 'Scheduled',
    });
    setIsApproveDialogOpen(true);
  };

  const closeApproveDialog = () => {
    setIsApproveDialogOpen(false);
    setSelectedRequest(null);
    setApproveState(INITIAL_APPROVE_STATE);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    if (approveState.patientId === '' || !approveState.appointmentDate) {
      setSnackbarMessage('Please select a patient and appointment date.');
      return;
    }

    const payload: AppointmentRequestApprovalPayload = {
      patient_id: Number(approveState.patientId),
      provider_id: approveState.providerId === '' ? undefined : Number(approveState.providerId),
      doctor_name: approveState.providerId === '' && selectedRequest.preferred_doctor
        ? `${selectedRequest.preferred_doctor.first_name} ${selectedRequest.preferred_doctor.last_name}`
        : undefined,
      appointment_date: approveState.appointmentDate.toISOString(),
      reason: approveState.reason,
      status: approveState.status,
      location: approveState.location,
      appointment_type: approveState.appointmentType,
      decision_notes: approveState.decisionNotes || selectedRequest.decision_notes || undefined,
    };

    try {
      await approveAppointmentRequest(selectedRequest.id, payload);
      setSnackbarMessage('Appointment request approved.');
      closeApproveDialog();
      loadRequests();
    } catch (err) {
      console.error('Failed to approve appointment request', err);
      setSnackbarMessage('Failed to approve appointment request.');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    const payload: AppointmentRequestUpdatePayload = {
      status: 'Rejected',
      decision_notes: rejectNotes || undefined,
    };
    try {
      await updateAppointmentRequest(selectedRequest.id, payload);
      setSnackbarMessage('Appointment request rejected.');
      setIsRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectNotes('');
      loadRequests();
    } catch (err) {
      console.error('Failed to reject appointment request', err);
      setSnackbarMessage('Failed to reject appointment request.');
    }
  };

  const handleMoveToReview = async (request: AppointmentRequest) => {
    const payload: AppointmentRequestUpdatePayload = { status: 'In Review' };
    try {
      await updateAppointmentRequest(request.id, payload);
      setSnackbarMessage('Appointment request flagged as In Review.');
      loadRequests();
    } catch (err) {
      console.error('Failed to update appointment request status', err);
      setSnackbarMessage('Failed to update appointment request status.');
    }
  };

  const renderStatusChip = (status: AppointmentRequestStatus) => {
    switch (status) {
      case 'Approved':
        return <Chip label="Approved" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'Rejected':
        return <Chip label="Rejected" color="error" size="small" icon={<CancelIcon />} />;
      case 'In Review':
        return <Chip label="In Review" color="warning" size="small" />;
      case 'Completed':
        return <Chip label="Completed" color="primary" size="small" />;
      default:
        return <Chip label="Pending" color="default" size="small" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Toolbar disableGutters sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" component="h1">Appointment Requests</Typography>
          <Typography variant="body2" color="text.secondary">
            Review and convert public appointment inquiries into scheduled visits.
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Select
            size="small"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <MenuItem value="All">All</MenuItem>
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <IconButton onClick={loadRequests} aria-label="Refresh appointment requests list">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Preferred Date</TableCell>
              <TableCell>Preferred Doctor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => {
              const preferredDoctorLabel = request.preferred_doctor
                ? `${request.preferred_doctor.first_name} ${request.preferred_doctor.last_name}`
                : 'Any available';
              const submittedAt = format(new Date(request.created_at), 'PPP p');
              const preferredDate = format(new Date(request.preferred_date), 'PPP');
              return (
                <TableRow key={request.id} hover>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{submittedAt}</TableCell>
                  <TableCell>{request.full_name}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{request.email}</Typography>
                    <Typography variant="body2" color="text.secondary">{request.phone_number}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{preferredDate}</Typography>
                    {request.preferred_time && (
                      <Typography variant="body2" color="text.secondary">{request.preferred_time}</Typography>
                    )}
                  </TableCell>
                  <TableCell>{preferredDoctorLabel}</TableCell>
                  <TableCell>{renderStatusChip(request.status)}</TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" noWrap title={request.reason || ''}>
                      {request.reason || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      <IconButton
                        color="primary"
                        onClick={() => setDetailRequest(request)}
                        aria-label={`View details for request ${request.id}`}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      {(request.status === 'Pending' || request.status === 'In Review') && (
                        <>
                          {request.status === 'Pending' && (
                            <Button size="small" onClick={() => handleMoveToReview(request)}>Mark In Review</Button>
                          )}
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => openApproveDialog(request)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedRequest(request);
                              setRejectNotes('');
                              setIsRejectDialogOpen(true);
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(detailRequest)} onClose={() => setDetailRequest(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Appointment Request Details</DialogTitle>
        <DialogContent dividers>
          {detailRequest && (
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
              <Box>
                <Typography variant="overline">Contact</Typography>
                <Typography variant="body2">{detailRequest.full_name}</Typography>
                <Typography variant="body2">{detailRequest.email}</Typography>
                <Typography variant="body2">{detailRequest.phone_number}</Typography>
              </Box>
              <Box>
                <Typography variant="overline">Preferred Schedule</Typography>
                <Typography variant="body2">{format(new Date(detailRequest.preferred_date), 'PPP')}</Typography>
                {detailRequest.preferred_time && (
                  <Typography variant="body2">{detailRequest.preferred_time}</Typography>
                )}
              </Box>
              <Box>
                <Typography variant="overline">Preferred Doctor</Typography>
                <Typography variant="body2">
                  {detailRequest.preferred_doctor
                    ? `${detailRequest.preferred_doctor.first_name} ${detailRequest.preferred_doctor.last_name}`
                    : 'Any'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="overline">Submitted</Typography>
                <Typography variant="body2">{format(new Date(detailRequest.created_at), 'PPP p')}</Typography>
              </Box>
              <Box gridColumn={{ xs: '1 / -1', sm: '1 / -1' }}>
                <Typography variant="overline">Reason</Typography>
                <Typography variant="body2">{detailRequest.reason || '—'}</Typography>
              </Box>
              <Box gridColumn={{ xs: '1 / -1', sm: '1 / -1' }}>
                <Typography variant="overline">Decision Notes</Typography>
                <Typography variant="body2">{detailRequest.decision_notes || '—'}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailRequest(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isApproveDialogOpen} onClose={closeApproveDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Appointment Request</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                label="Existing Patient"
                value={approveState.patientId}
                fullWidth
                onChange={(event) => setApproveState((prev) => ({ ...prev, patientId: event.target.value as number | '' }))}
                helperText="Select the patient record to link with this appointment"
              >
                <MenuItem value="">Select patient</MenuItem>
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name} ({patient.email})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Assign Provider"
                value={approveState.providerId}
                onChange={(event) => setApproveState((prev) => ({ ...prev, providerId: event.target.value as number | '' }))}
                fullWidth
              >
                <MenuItem value="">No specific provider</MenuItem>
                {providers.map((provider) => (
                  <MenuItem key={provider.id} value={provider.id}>
                    {provider.first_name} {provider.last_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DateTimePicker
                label="Appointment Date"
                value={approveState.appointmentDate}
                onChange={(newValue) => setApproveState((prev) => ({ ...prev, appointmentDate: newValue }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Reason"
                value={approveState.reason}
                onChange={(event) => setApproveState((prev) => ({ ...prev, reason: event.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Location"
                value={approveState.location}
                onChange={(event) => setApproveState((prev) => ({ ...prev, location: event.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Visit Type"
                value={approveState.appointmentType}
                onChange={(event) => setApproveState((prev) => ({ ...prev, appointmentType: event.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Decision Notes"
                value={approveState.decisionNotes}
                onChange={(event) => setApproveState((prev) => ({ ...prev, decisionNotes: event.target.value }))}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Appointment Status"
                value={approveState.status}
                onChange={(event) => setApproveState((prev) => ({ ...prev, status: event.target.value }))}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeApproveDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleApprove}>
            Convert to Appointment
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onClose={() => setIsRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Appointment Request</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Decision Notes"
            value={rejectNotes}
            onChange={(event) => setRejectNotes(event.target.value)}
            fullWidth
            multiline
            minRows={3}
            placeholder="Provide a short explanation for rejecting this request"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleReject}>
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={5000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="info" onClose={() => setSnackbarMessage(null)} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
