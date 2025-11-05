import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';

interface AddPatientDialogProps {
  open: boolean;
  onClose: () => void;
  onAddPatient: (patient: Record<string, unknown>) => void;
}

export default function AddPatientDialog({ open, onClose, onAddPatient }: AddPatientDialogProps) {
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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = () => {
    onAddPatient(formData);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Patient</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please fill out the form below to add a new patient.
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
        <Button onClick={handleSubmit} variant="contained">Add</Button>
      </DialogActions>
    </Dialog>
  );
}
