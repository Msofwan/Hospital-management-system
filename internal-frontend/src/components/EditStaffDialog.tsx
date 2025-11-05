import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import apiClient from '../api/client';
import type { Role, Staff, StaffFormPayload } from '../types/hms';

interface EditStaffDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: (staff: StaffFormPayload) => void;
  staffMember: Staff;
}

export default function EditStaffDialog({ open, onClose, onEdit, staffMember }: EditStaffDialogProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [formState, setFormState] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    role_id: '' as number | '',
    department: '',
    specialization: '',
    license_number: '',
    employment_type: '',
    password: '',
  });

  useEffect(() => {
    if (!open) return;
    setFormState({
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
      email: staffMember.email,
      contact_number: staffMember.contact_number,
      role_id: staffMember.role.id,
      department: staffMember.department ?? '',
      specialization: staffMember.specialization ?? '',
      license_number: staffMember.license_number ?? '',
      employment_type: staffMember.employment_type ?? '',
      password: '',
    });
    loadRoles();
  }, [open, staffMember]);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await apiClient.get<Role[]>('/roles/');
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to fetch roles', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleChange = (field: keyof typeof formState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = () => {
    const { first_name, last_name, email, contact_number, role_id } = formState;
    if (!first_name || !last_name || !email || !contact_number || !role_id) return;
    const payload: StaffFormPayload = {
      first_name,
      last_name,
      email,
      contact_number,
      role_id,
      department: formState.department || undefined,
      specialization: formState.specialization || undefined,
      license_number: formState.license_number || undefined,
      employment_type: formState.employment_type || undefined,
    };
    if (formState.password) {
      payload.password = formState.password;
    }
    onEdit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Staff Member</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="First Name" fullWidth value={formState.first_name} onChange={handleChange('first_name')} />
        <TextField margin="dense" label="Last Name" fullWidth value={formState.last_name} onChange={handleChange('last_name')} />
        <TextField margin="dense" label="Email" type="email" fullWidth value={formState.email} onChange={handleChange('email')} />
        <TextField margin="dense" label="New Password" type="password" fullWidth value={formState.password} onChange={handleChange('password')} helperText="Leave blank to keep current password" />
        <TextField margin="dense" label="Contact Number" fullWidth value={formState.contact_number} onChange={handleChange('contact_number')} />
        <TextField margin="dense" label="Department" fullWidth value={formState.department} onChange={handleChange('department')} />
        <TextField margin="dense" label="Specialization" fullWidth value={formState.specialization} onChange={handleChange('specialization')} />
        <TextField margin="dense" label="License Number" fullWidth value={formState.license_number} onChange={handleChange('license_number')} />
        <TextField margin="dense" label="Employment Type" fullWidth value={formState.employment_type} onChange={handleChange('employment_type')} />
        {loadingRoles ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <FormControl fullWidth margin="dense">
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={formState.role_id}
              label="Role"
              onChange={(event) => setFormState((prev) => ({ ...prev, role_id: event.target.value as number }))}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}