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

interface StaffMember {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string;
    role_id: number;
    role: Role;
}

interface EditStaffDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: (staff: any) => void; // Simplified
  staffMember: StaffMember;
}

const apiClient = axios.create({ baseURL: 'http://localhost:8000' });
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function EditStaffDialog({ open, onClose, onEdit, staffMember }: EditStaffDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roleId, setRoleId] = useState<number | ''>('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState(''); // Optional new password

  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    if (open) {
      // Populate form with existing staff data
      setFirstName(staffMember.first_name);
      setLastName(staffMember.last_name);
      setRoleId(staffMember.role_id);
      setEmail(staffMember.email);
      setContactNumber(staffMember.contact_number);
      setPassword(''); // Clear password field

      // Fetch roles
      setLoadingRoles(true);
      apiClient.get<Role[]>('/roles/')
        .then(response => {
          setRoles(response.data);
        })
        .catch(error => console.error("Failed to fetch roles", error))
        .finally(() => setLoadingRoles(false));
    }
  }, [open, staffMember]);

  const handleSubmit = () => {
    if (firstName && lastName && roleId && email && contactNumber) {
        const payload: any = {
            first_name: firstName,
            last_name: lastName,
            role_id: roleId,
            email,
            contact_number: contactNumber,
        };
        // Only include password if it has been changed
        if (password) {
            payload.password = password;
        }
        onEdit(payload);
        onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Staff Member</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="First Name" type="text" fullWidth value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <TextField margin="dense" label="Last Name" type="text" fullWidth value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <TextField margin="dense" label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField margin="dense" label="New Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} helperText="Leave blank to keep current password" />
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
        <Button onClick={handleSubmit} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}