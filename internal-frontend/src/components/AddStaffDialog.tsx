import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box
} from '@mui/material';
import axios from 'axios';

// Define interfaces
interface Role {
  id: number;
  name: string;
}

interface AddStaffDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (staff: any) => void; // Simplified for this refactor
}

const apiClient = axios.create({ baseURL: 'http://localhost:8000' });
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function AddStaffDialog({ open, onClose, onAdd }: AddStaffDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roleId, setRoleId] = useState<number | ''>('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form
      setFirstName('');
      setLastName('');
      setRoleId('');
      setEmail('');
      setContactNumber('');
      setPassword('');
      
      // Fetch roles
      setLoadingRoles(true);
      apiClient.get<Role[]>('/roles/')
        .then(response => {
          setRoles(response.data);
        })
        .catch(error => console.error("Failed to fetch roles", error))
        .finally(() => setLoadingRoles(false));
    }
  }, [open]);

  const handleSubmit = () => {
    if (firstName && lastName && roleId && email && contactNumber && password) {
      const role = roles.find(r => r.id === roleId);
      onAdd({
        first_name: firstName,
        last_name: lastName,
        role: role, // Pass the full role object
        email,
        contact_number: contactNumber,
        password
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Staff Member</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="First Name" type="text" fullWidth value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <TextField margin="dense" label="Last Name" type="text" fullWidth value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <TextField margin="dense" label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField margin="dense" label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
        <TextField margin="dense" label="Contact Number" type="text" fullWidth value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
        {loadingRoles ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>
        ) : (
            <FormControl fullWidth margin="dense">
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                labelId="role-select-label"
                value={roleId}
                label="Role"
                onChange={(e) => setRoleId(e.target.value as number)}
                >
                {roles.map(role => (
                    <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                ))}
                </Select>
            </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Add</Button>
      </DialogActions>
    </Dialog>
  );
}