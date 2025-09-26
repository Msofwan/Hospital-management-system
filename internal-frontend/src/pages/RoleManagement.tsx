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
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';

import AddRoleDialog from '../components/AddRoleDialog';
import EditRoleDialog from '../components/EditRoleDialog';
import ConfirmationDialog from '../components/ConfirmationDialog';

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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

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

  const handleUpdateRole = async (updatedRole: Role) => {
    try {
      await apiClient.put(`/roles/${updatedRole.id}`, updatedRole);
      fetchRoles(); // Refresh the list
      setIsEditDialogOpen(false);
      setSelectedRole(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update role.');
      console.error(err);
    }
  };

  const handleDeleteRole = async () => {
    if (selectedRole) {
      try {
        await apiClient.delete(`/roles/${selectedRole.id}`);
        fetchRoles(); // Refresh the list
        setIsDeleteDialogOpen(false);
        setSelectedRole(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete role.');
        console.error(err);
      }
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, role: Role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setAnchorEl(null); // This closes the little menu
    setIsDeleteDialogOpen(true); // This opens the confirmation dialog
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
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.id}</TableCell>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={(event) => handleMenuClick(event, role)}><MoreVertIcon /></IconButton>
                  <Menu anchorEl={anchorEl} open={openMenu && selectedRole?.id === role.id} onClose={handleMenuClose}>
                    <MenuItem onClick={handleEditClick}><EditIcon sx={{ mr: 1 }} /> Edit</MenuItem>
                    <MenuItem onClick={handleDeleteClick}><DeleteIcon sx={{ mr: 1 }} /> Delete</MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AddRoleDialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onAdd={handleAddRole} />
      {selectedRole && (
        <EditRoleDialog open={isEditDialogOpen} onClose={() => {setIsEditDialogOpen(false); setSelectedRole(null);}} onUpdate={handleUpdateRole} role={selectedRole} />
      )}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedRole(null); }}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${selectedRole?.name}"?`}
      />
    </Box>
  );
}
