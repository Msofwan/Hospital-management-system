import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from '@mui/material';

interface Role {
  id: number;
  name: string;
  description: string | null;
}

interface EditRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (roleData: Role) => void;
  role: Role | null;
}

export default function EditRoleDialog({ open, onClose, onUpdate, role }: EditRoleDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || '');
    }
  }, [role]);

  const handleSubmit = () => {
    if (name && role) {
      onUpdate({ ...role, name, description });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Role</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Role Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Update</Button>
      </DialogActions>
    </Dialog>
  );
}