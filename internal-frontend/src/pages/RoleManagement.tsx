import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

interface Role {
  id: number;
  name: string;
  description: string | null;
}

const API_BASE_URL = 'http://localhost:8000';

// Axios instance with auth token
const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Role[]>('/roles/');
      setRoles(response.data);
    } catch (err) {
      setError('Failed to fetch roles.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = async (newRoleData: { name: string; description: string }) => {
    try {
      await apiClient.post('/roles/', newRoleData);
      fetchRoles(); // Refresh the list
      setIsAddDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add role.');
      console.error(err);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }

  if (error) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><Typography color="error">{error}</Typography></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">Role Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddDialogOpen(true)}>Add Role</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.id}</TableCell>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AddRoleDialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onAdd={handleAddRole} />
    </Box>
  );
}

// AddRoleDialog Component
interface AddRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (roleData: { name: string; description: string }) => void;
}

function AddRoleDialog({ open, onClose, onAdd }: AddRoleDialogProps) {
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
