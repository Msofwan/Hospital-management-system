import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from '@mui/material';

interface AddRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (roleData: { name: string; description: string }) => void;
}

export default function AddRoleDialog({ open, onClose, onAdd }: AddRoleDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (name) {
      onAdd({ name, description });
      setName('');
      setDescription('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Role</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="Role Name" type="text" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
        <TextField margin="dense" label="Description" type="text" fullWidth multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Add</Button>
      </DialogActions>
    </Dialog>
  );
}