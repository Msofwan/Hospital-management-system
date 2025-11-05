import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';

import type { Patient } from '../types/hms';

interface EditPatientDialogProps {
  open: boolean;
  onClose: () => void;
  onEditPatient: (patient: Record<string, unknown>) => void;
  patient: Patient | null;
}

export default function EditPatientDialog({ open, onClose, onEditPatient, patient }: EditPatientDialogProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    contact_number: '',
    email: '',
    bpjs_number: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    insurance_provider: '',
    insurance_policy_number: ''
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        contact_number: patient.contact_number,
        email: patient.email,
        bpjs_number: patient.bpjs_number ?? '',
        address: patient.address ?? '',
        emergency_contact_name: patient.emergency_contact_name ?? '',
        emergency_contact_number: patient.emergency_contact_number ?? '',
        insurance_provider: patient.insurance_provider ?? '',
        insurance_policy_number: patient.insurance_policy_number ?? '',
      });
    }
  }, [patient]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = () => {
    onEditPatient(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Patient</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please update the patient's information below.
        </DialogContentText>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField autoFocus margin="dense" name="first_name" label="First Name" type="text" fullWidth variant="standard" value={formData.first_name} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField margin="dense" name="last_name" label="Last Name" type="text" fullWidth variant="standard" value={formData.last_name} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField margin="dense" name="date_of_birth" label="Date of Birth" type="date" fullWidth variant="standard" value={formData.date_of_birth} InputLabelProps={{ shrink: true }} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField margin="dense" name="contact_number" label="Contact Number" type="text" fullWidth variant="standard" value={formData.contact_number} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField margin="dense" name="email" label="Email Address" type="email" fullWidth variant="standard" value={formData.email} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField margin="dense" name="bpjs_number" label="BPJS Number" type="text" fullWidth variant="standard" value={formData.bpjs_number} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField margin="dense" name="address" label="Address" type="text" fullWidth variant="standard" value={formData.address} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField margin="dense" name="emergency_contact_name" label="Emergency Contact Name" type="text" fullWidth variant="standard" value={formData.emergency_contact_name} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField margin="dense" name="emergency_contact_number" label="Emergency Contact Number" type="text" fullWidth variant="standard" value={formData.emergency_contact_number} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField margin="dense" name="insurance_provider" label="Insurance Provider" type="text" fullWidth variant="standard" value={formData.insurance_provider} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField margin="dense" name="insurance_policy_number" label="Insurance Policy Number" type="text" fullWidth variant="standard" value={formData.insurance_policy_number} onChange={handleChange} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
