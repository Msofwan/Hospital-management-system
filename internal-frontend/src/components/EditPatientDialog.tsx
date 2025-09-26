import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  contact_number: string;
  email: string;
}

interface EditPatientDialogProps {
  open: boolean;
  onClose: () => void;
  onEditPatient: (patient: Omit<Patient, 'id'>) => void;
  patient: Patient | null;
}

export default function EditPatientDialog({ open, onClose, onEditPatient, patient }: EditPatientDialogProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    contact_number: '',
    email: ''
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        contact_number: patient.contact_number,
        email: patient.email,
      });
    }
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onEditPatient(formData);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Patient</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please update the patient's information below.
        </DialogContentText>
        <TextField autoFocus margin="dense" name="first_name" label="First Name" type="text" fullWidth variant="standard" value={formData.first_name} onChange={handleChange} />
        <TextField margin="dense" name="last_name" label="Last Name" type="text" fullWidth variant="standard" value={formData.last_name} onChange={handleChange} />
        <TextField margin="dense" name="date_of_birth" label="Date of Birth" type="date" fullWidth variant="standard" value={formData.date_of_birth} InputLabelProps={{ shrink: true }} onChange={handleChange} />
        <TextField margin="dense" name="contact_number" label="Contact Number" type="text" fullWidth variant="standard" value={formData.contact_number} onChange={handleChange} />
        <TextField margin="dense" name="email" label="Email Address" type="email" fullWidth variant="standard" value={formData.email} onChange={handleChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
