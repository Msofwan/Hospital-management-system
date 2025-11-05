import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

import apiClient from '../api/client';
import type {
  AdmissionSummary,
  Bed,
  LabResult,
  Patient,
  PatientVisit,
  StaffSummary,
} from '../types/hms';

interface PatientDetailsDialogProps {
  open: boolean;
  patient: Patient | null;
  onClose: () => void;
  onRefresh: () => void;
}

type VisitFormState = {
  provider_id: number | '';
  visit_date: Date | null;
  chief_complaint: string;
  diagnosis: string;
  allergies: string;
  treatment_plan: string;
  notes: string;
};

type PrescriptionFormState = {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  start_date: Date | null;
  end_date: Date | null;
};

type LabResultFormState = {
  test_name: string;
  result_value: string;
  unit: string;
  normal_range: string;
  result_date: Date | null;
  notes: string;
};

type AdmissionFormState = {
  bed_id: number | '';
  attending_staff_id: number | '';
  reason: string;
  admitted_at: Date | null;
};

const initialVisitState: VisitFormState = {
  provider_id: '',
  visit_date: new Date(),
  chief_complaint: '',
  diagnosis: '',
  allergies: '',
  treatment_plan: '',
  notes: '',
};

const initialPrescriptionState: PrescriptionFormState = {
  medicine_name: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
  start_date: null,
  end_date: null,
};

const initialLabResultState: LabResultFormState = {
  test_name: '',
  result_value: '',
  unit: '',
  normal_range: '',
  result_date: new Date(),
  notes: '',
};

const initialAdmissionState: AdmissionFormState = {
  bed_id: '',
  attending_staff_id: '',
  reason: '',
  admitted_at: new Date(),
};

export default function PatientDetailsDialog({ open, patient, onClose, onRefresh }: PatientDetailsDialogProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const [doctors, setDoctors] = useState<StaffSummary[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [visitFormOpen, setVisitFormOpen] = useState(false);
  const [prescriptionFormOpen, setPrescriptionFormOpen] = useState(false);
  const [labResultFormOpen, setLabResultFormOpen] = useState(false);
  const [admissionFormOpen, setAdmissionFormOpen] = useState(false);
  const [activeVisit, setActiveVisit] = useState<PatientVisit | null>(null);
  const [visitForm, setVisitForm] = useState<VisitFormState>(initialVisitState);
  const [prescriptionForm, setPrescriptionForm] = useState<PrescriptionFormState>(initialPrescriptionState);
  const [labResultForm, setLabResultForm] = useState<LabResultFormState>(initialLabResultState);
  const [admissionForm, setAdmissionForm] = useState<AdmissionFormState>(initialAdmissionState);
  const [submitting, setSubmitting] = useState(false);
  const [discharging, setDischarging] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTabIndex(0);
    setVisitForm(initialVisitState);
    setPrescriptionForm(initialPrescriptionState);
    setLabResultForm(initialLabResultState);
    setAdmissionForm(initialAdmissionState);
    fetchSupportData();
  }, [open]);

  const fetchSupportData = async () => {
    try {
      const [staffResponse, bedsResponse] = await Promise.all([
        apiClient.get<StaffSummary[]>('/staff/'),
        apiClient.get<Bed[]>('/beds/'),
      ]);
      const doctorUsers = staffResponse.data.filter((staff) => staff.role?.name === 'Doctor');
      setDoctors(doctorUsers);
      setBeds(bedsResponse.data);
    } catch (error) {
      console.error('Failed to load supporting data', error);
    }
  };

  const handleVisitSubmit = async () => {
    if (!patient || !visitForm.provider_id || !visitForm.visit_date) return;
    try {
      setSubmitting(true);
      await apiClient.post('/patient-visits/', {
        patient_id: patient.id,
        provider_id: visitForm.provider_id,
        visit_date: visitForm.visit_date.toISOString(),
        chief_complaint: visitForm.chief_complaint,
        diagnosis: visitForm.diagnosis,
        allergies: visitForm.allergies,
        treatment_plan: visitForm.treatment_plan,
        notes: visitForm.notes,
      });
      setVisitFormOpen(false);
      setVisitForm(initialVisitState);
      onRefresh();
    } catch (error) {
      console.error('Failed to create visit', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrescriptionSubmit = async () => {
    if (!activeVisit || !prescriptionForm.medicine_name) return;
    try {
      setSubmitting(true);
      await apiClient.post('/prescriptions/', {
        visit_id: activeVisit.id,
        medicine_name: prescriptionForm.medicine_name,
        dosage: prescriptionForm.dosage,
        frequency: prescriptionForm.frequency,
        duration: prescriptionForm.duration,
        instructions: prescriptionForm.instructions,
        start_date: prescriptionForm.start_date ? prescriptionForm.start_date.toISOString().split('T')[0] : null,
        end_date: prescriptionForm.end_date ? prescriptionForm.end_date.toISOString().split('T')[0] : null,
      });
      setPrescriptionFormOpen(false);
      setPrescriptionForm(initialPrescriptionState);
      onRefresh();
    } catch (error) {
      console.error('Failed to create prescription', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLabResultSubmit = async () => {
    if (!activeVisit || !labResultForm.test_name || !labResultForm.result_date) return;
    try {
      setSubmitting(true);
      await apiClient.post('/lab-results/', {
        visit_id: activeVisit.id,
        test_name: labResultForm.test_name,
        result_value: labResultForm.result_value,
        unit: labResultForm.unit,
        normal_range: labResultForm.normal_range,
        result_date: labResultForm.result_date.toISOString(),
        notes: labResultForm.notes,
      });
      setLabResultFormOpen(false);
      setLabResultForm(initialLabResultState);
      onRefresh();
    } catch (error) {
      console.error('Failed to create lab result', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdmissionSubmit = async () => {
    if (!patient || !admissionForm.bed_id || !admissionForm.attending_staff_id || !admissionForm.admitted_at) return;
    try {
      setSubmitting(true);
      await apiClient.post('/admissions/', {
        patient_id: patient.id,
        bed_id: admissionForm.bed_id,
        attending_staff_id: admissionForm.attending_staff_id,
        reason: admissionForm.reason,
        admitted_at: admissionForm.admitted_at.toISOString(),
        status: 'Admitted',
      });
      setAdmissionFormOpen(false);
      setAdmissionForm(initialAdmissionState);
      onRefresh();
    } catch (error) {
      console.error('Failed to create admission', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDischarge = async (admission: AdmissionSummary) => {
    try {
      setDischarging(true);
      await apiClient.put(`/admissions/${admission.id}`, {
        status: 'Discharged',
        discharged_at: new Date().toISOString(),
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to discharge patient', error);
    } finally {
      setDischarging(false);
    }
  };

  const visits = useMemo(() => patient?.visits ?? [], [patient]);
  const admissions = useMemo(() => patient?.admissions ?? [], [patient]);
  const invoices = useMemo(() => patient?.invoices ?? [], [patient]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Patient Details</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {patient ? (
          <Box>
            <Box mb={2}>
              <Typography variant="h5">{patient.first_name} {patient.last_name}</Typography>
              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                {patient.bpjs_number && <Chip label={`BPJS: ${patient.bpjs_number}`} />}
                {patient.insurance_provider && <Chip label={`Insurance: ${patient.insurance_provider}`} />}
                <Chip label={`DOB: ${format(new Date(patient.date_of_birth), 'PP')}`} />
              </Stack>
            </Box>
            <Tabs value={tabIndex} onChange={(_, value) => setTabIndex(value)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Overview" />
              <Tab label={`Visits (${visits.length})`} />
              <Tab label={`Admissions (${admissions.length})`} />
              <Tab label={`Invoices (${invoices.length})`} />
            </Tabs>

            {tabIndex === 0 && (
              <Box mt={3}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2">Contact Information</Typography>
                    <Typography>Phone: {patient.contact_number}</Typography>
                    <Typography>Email: {patient.email}</Typography>
                    <Typography>Address: {patient.address ?? '—'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2">Emergency Contact</Typography>
                    <Typography>Name: {patient.emergency_contact_name ?? '—'}</Typography>
                    <Typography>Number: {patient.emergency_contact_number ?? '—'}</Typography>
                    <Typography>Insurance #: {patient.insurance_policy_number ?? '—'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {tabIndex === 1 && (
              <Box mt={3}>
                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <Button startIcon={<AddIcon />} variant="contained" onClick={() => setVisitFormOpen(true)}>
                    Add Visit
                  </Button>
                </Box>
                {visits.length === 0 ? (
                  <Typography>No visit history recorded.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {visits.map((visit) => (
                      <Box key={visit.id} border={1} borderColor="divider" borderRadius={2} p={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1">
                              {format(new Date(visit.visit_date), 'PPP p')} — {visit.provider.first_name} {visit.provider.last_name}
                            </Typography>
                            <Typography variant="body2">Diagnosis: {visit.diagnosis ?? '—'}</Typography>
                            <Typography variant="body2">Chief complaint: {visit.chief_complaint ?? '—'}</Typography>
                            <Typography variant="body2">Treatment: {visit.treatment_plan ?? '—'}</Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setActiveVisit(visit);
                                setPrescriptionFormOpen(true);
                              }}
                            >
                              Add Prescription
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setActiveVisit(visit);
                                setLabResultFormOpen(true);
                              }}
                            >
                              Add Lab Result
                            </Button>
                          </Stack>
                        </Stack>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2">Prescriptions</Typography>
                            {visit.prescriptions.length === 0 ? (
                              <Typography variant="body2">None</Typography>
                            ) : (
                              <Stack spacing={1} mt={1}>
                                {visit.prescriptions.map((prescription) => (
                                  <Box key={prescription.id} border={1} borderColor="divider" borderRadius={1} p={1.5}>
                                    <Typography variant="body2" fontWeight={600}>{prescription.medicine_name}</Typography>
                                    <Typography variant="body2">Dosage: {prescription.dosage ?? '—'}</Typography>
                                    <Typography variant="body2">Frequency: {prescription.frequency ?? '—'}</Typography>
                                    <Typography variant="body2">Duration: {prescription.duration ?? '—'}</Typography>
                                  </Box>
                                ))}
                              </Stack>
                            )}
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2">Lab Results</Typography>
                            {visit.lab_results.length === 0 ? (
                              <Typography variant="body2">None</Typography>
                            ) : (
                              <Stack spacing={1} mt={1}>
                                {visit.lab_results.map((result: LabResult) => (
                                  <Box key={result.id} border={1} borderColor="divider" borderRadius={1} p={1.5}>
                                    <Typography variant="body2" fontWeight={600}>{result.test_name}</Typography>
                                    <Typography variant="body2">Value: {result.result_value ?? '—'} {result.unit ?? ''}</Typography>
                                    <Typography variant="body2">Normal: {result.normal_range ?? '—'}</Typography>
                                    <Typography variant="caption" display="block">Collected: {format(new Date(result.result_date), 'PPP p')}</Typography>
                                  </Box>
                                ))}
                              </Stack>
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {tabIndex === 2 && (
              <Box mt={3}>
                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <Button startIcon={<AddIcon />} variant="contained" onClick={() => setAdmissionFormOpen(true)}>
                    Create Admission
                  </Button>
                </Box>
                {admissions.length === 0 ? (
                  <Typography>No admissions recorded.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {admissions.map((admission) => (
                      <Box key={admission.id} border={1} borderColor="divider" borderRadius={2} p={2}>
                        <Typography variant="subtitle1">{format(new Date(admission.admitted_at), 'PPP p')}</Typography>
                        <Typography variant="body2">Reason: {admission.reason ?? '—'}</Typography>
                        <Typography variant="body2">Status: {admission.status}</Typography>
                        <Typography variant="body2">Bed: {admission.bed ? `${admission.bed.room_number} - ${admission.bed.bed_number}` : '—'}</Typography>
                        <Typography variant="body2">Attending: {admission.attending_provider ? `${admission.attending_provider.first_name} ${admission.attending_provider.last_name}` : '—'}</Typography>
                        {admission.discharged_at && (
                          <Typography variant="body2">Discharged: {format(new Date(admission.discharged_at), 'PPP p')}</Typography>
                        )}
                        {admission.status !== 'Discharged' && (
                          <Box mt={2}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleDischarge(admission)}
                              disabled={discharging}
                            >
                              Mark Discharged
                            </Button>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {tabIndex === 3 && (
              <Box mt={3}>
                {invoices.length === 0 ? (
                  <Typography>No invoices generated.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {invoices.map((invoice) => (
                      <Box key={invoice.id} border={1} borderColor="divider" borderRadius={2} p={2}>
                        <Typography variant="subtitle1">Invoice #{invoice.id}</Typography>
                        <Typography variant="body2">Amount: Rp {invoice.amount.toLocaleString()}</Typography>
                        <Typography variant="body2">Status: {invoice.status}</Typography>
                        <Typography variant="body2">Description: {invoice.description}</Typography>
                        <Typography variant="body2">Issued: {format(new Date(invoice.date_issued), 'PPP')}</Typography>
                        {invoice.due_date && <Typography variant="body2">Due: {format(new Date(invoice.due_date), 'PPP')}</Typography>}
                        {invoice.insurance_provider && (
                          <Typography variant="body2">Insurance: {invoice.insurance_provider} ({invoice.insurance_status ?? 'status unknown'})</Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </Box>
        ) : (
          <Typography>No patient selected.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      {/* Add Visit Dialog */}
      <Dialog open={visitFormOpen} onClose={() => setVisitFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Patient Visit</DialogTitle>
        <DialogContent dividers>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Provider"
            value={visitForm.provider_id}
            onChange={(event) => setVisitForm((prev) => ({ ...prev, provider_id: Number(event.target.value) }))}
          >
            <MenuItem value="" disabled>
              Select provider
            </MenuItem>
            {doctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                {doctor.first_name} {doctor.last_name}
              </MenuItem>
            ))}
          </TextField>
          <DateTimePicker
            label="Visit Date"
            value={visitForm.visit_date}
            onChange={(value) => setVisitForm((prev) => ({ ...prev, visit_date: value }))}
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
          />
          <TextField
            margin="normal"
            label="Chief Complaint"
            fullWidth
            value={visitForm.chief_complaint}
            onChange={(event) => setVisitForm((prev) => ({ ...prev, chief_complaint: event.target.value }))}
          />
          <TextField
            margin="normal"
            label="Diagnosis"
            fullWidth
            value={visitForm.diagnosis}
            onChange={(event) => setVisitForm((prev) => ({ ...prev, diagnosis: event.target.value }))}
          />
          <TextField
            margin="normal"
            label="Allergies"
            fullWidth
            value={visitForm.allergies}
            onChange={(event) => setVisitForm((prev) => ({ ...prev, allergies: event.target.value }))}
          />
          <TextField
            margin="normal"
            label="Treatment Plan"
            fullWidth
            multiline
            minRows={2}
            value={visitForm.treatment_plan}
            onChange={(event) => setVisitForm((prev) => ({ ...prev, treatment_plan: event.target.value }))}
          />
          <TextField
            margin="normal"
            label="Notes"
            fullWidth
            multiline
            minRows={2}
            value={visitForm.notes}
            onChange={(event) => setVisitForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVisitFormOpen(false)}>Cancel</Button>
          <Button onClick={handleVisitSubmit} variant="contained" disabled={submitting || !visitForm.provider_id || !visitForm.visit_date}>
            Save Visit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Prescription Dialog */}
      <Dialog open={prescriptionFormOpen} onClose={() => setPrescriptionFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Prescription</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="normal"
            label="Medicine Name"
            fullWidth
            value={prescriptionForm.medicine_name}
            onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, medicine_name: event.target.value }))}
          />
          <TextField
            margin="normal"
            label="Dosage"
            fullWidth
            value={prescriptionForm.dosage}
            onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, dosage: event.target.value }))}
          />
          <TextField
            margin="normal"
            label="Frequency"
            fullWidth
            value={prescriptionForm.frequency}
            onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, frequency: event.target.value }))}
          />
          <TextField
            margin="normal"
            label="Duration"
            fullWidth
            value={prescriptionForm.duration}
            onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, duration: event.target.value }))}
          />
          <TextField
            margin="normal"
            label="Instructions"
            fullWidth
            multiline
            minRows={2}
            value={prescriptionForm.instructions}
            onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, instructions: event.target.value }))}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={1}>
            <DatePicker
              label="Start Date"
              value={prescriptionForm.start_date}
              onChange={(value) => setPrescriptionForm((prev) => ({ ...prev, start_date: value }))}
            />
            <DatePicker
              label="End Date"
              value={prescriptionForm.end_date}
              onChange={(value) => setPrescriptionForm((prev) => ({ ...prev, end_date: value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrescriptionFormOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePrescriptionSubmit}
            variant="contained"
            disabled={submitting || !prescriptionForm.medicine_name}
          >
            Save Prescription
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Lab Result Dialog */}
      <Dialog open={labResultFormOpen} onClose={() => setLabResultFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Lab Result</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="normal"
            label="Test Name"
            fullWidth
            value={labResultForm.test_name}
            onChange={(event) => setLabResultForm((prev) => ({ ...prev, test_name: event.target.value }))}
          />
          <TextField
            margin="normal"
            label="Result Value"
            fullWidth
            value={labResultForm.result_value}
            onChange={(event) => setLabResultForm((prev) => ({ ...prev, result_value: event.target.value }))}
          />
          <TextField
            margin="normal"
            label="Unit"
            fullWidth
            value={labResultForm.unit}
            onChange={(event) => setLabResultForm((prev) => ({ ...prev, unit: event.target.value }))}
          />
          <TextField
            margin="normal"
            label="Normal Range"
            fullWidth
            value={labResultForm.normal_range}
            onChange={(event) => setLabResultForm((prev) => ({ ...prev, normal_range: event.target.value }))}
          />
          <DateTimePicker
            label="Result Date"
            value={labResultForm.result_date}
            onChange={(value) => setLabResultForm((prev) => ({ ...prev, result_date: value }))}
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
          />
          <TextField
            margin="normal"
            label="Notes"
            fullWidth
            multiline
            minRows={2}
            value={labResultForm.notes}
            onChange={(event) => setLabResultForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLabResultFormOpen(false)}>Cancel</Button>
          <Button
            onClick={handleLabResultSubmit}
            variant="contained"
            disabled={submitting || !labResultForm.test_name || !labResultForm.result_date}
          >
            Save Lab Result
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Admission Dialog */}
      <Dialog open={admissionFormOpen} onClose={() => setAdmissionFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Admission</DialogTitle>
        <DialogContent dividers>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Bed"
            value={admissionForm.bed_id}
            onChange={(event) => setAdmissionForm((prev) => ({ ...prev, bed_id: Number(event.target.value) }))}
          >
            <MenuItem value="" disabled>
              Select bed
            </MenuItem>
            {beds
              .filter((bed) => !bed.is_occupied)
              .map((bed) => (
                <MenuItem key={bed.id} value={bed.id}>
                  Room {bed.room_number} - Bed {bed.bed_number}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Attending Provider"
            value={admissionForm.attending_staff_id}
            onChange={(event) => setAdmissionForm((prev) => ({ ...prev, attending_staff_id: Number(event.target.value) }))}
          >
            <MenuItem value="" disabled>
              Select provider
            </MenuItem>
            {doctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                {doctor.first_name} {doctor.last_name}
              </MenuItem>
            ))}
          </TextField>
          <DateTimePicker
            label="Admitted At"
            value={admissionForm.admitted_at}
            onChange={(value) => setAdmissionForm((prev) => ({ ...prev, admitted_at: value }))}
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
          />
          <TextField
            margin="normal"
            label="Reason"
            fullWidth
            multiline
            minRows={2}
            value={admissionForm.reason}
            onChange={(event) => setAdmissionForm((prev) => ({ ...prev, reason: event.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdmissionFormOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAdmissionSubmit}
            variant="contained"
            disabled={
              submitting ||
              !admissionForm.bed_id ||
              !admissionForm.attending_staff_id ||
              !admissionForm.admitted_at
            }
          >
            Save Admission
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
