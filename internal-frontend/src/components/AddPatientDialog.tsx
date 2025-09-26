import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';

interface AddPatientDialogProps {
  open: boolean;
  onClose: () => void;
  onAddPatient: (patient: any) => void;
}

export default function AddPatientDialog({ open, onClose, onAddPatient }: AddPatientDialogProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    contact_number: '',
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        <TextField autoFocus margin="dense" name="first_name" label="First Name" type="text" fullWidth variant="standard" onChange={handleChange} />
        <TextField margin="dense" name="last_name" label="Last Name" type="text" fullWidth variant="standard" onChange={handleChange} />
        <TextField margin="dense" name="date_of_birth" label="Date of Birth" type="date" fullWidth variant="standard" InputLabelProps={{ shrink: true }} onChange={handleChange} />
        <TextField margin="dense" name="contact_number" label="Contact Number" type="text" fullWidth variant="standard" onChange={handleChange} />
        <TextField margin="dense" name="email" label="Email Address" type="email" fullWidth variant="standard" onChange={handleChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Add</Button>
      </DialogActions>
    </Dialog>
  );
}
