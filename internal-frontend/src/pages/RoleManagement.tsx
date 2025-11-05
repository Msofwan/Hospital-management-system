import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';
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

import apiClient from '../api/client';
import AddRoleDialog from '../components/AddRoleDialog';
import EditRoleDialog from '../components/EditRoleDialog';
import ConfirmationDialog from '../components/ConfirmationDialog';
import type { Role } from '../types/hms';

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
      console.error('Failed to fetch roles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = async (newRoleData: { name: string; description?: string | null }) => {
    try {
      await apiClient.post('/roles/', newRoleData);
      fetchRoles();
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Failed to add role', err);
      setError('Failed to add role.');
    }
  };

  const handleUpdateRole = async (updatedRole: Role) => {
    try {
      await apiClient.put(`/roles/${updatedRole.id}`, {
        name: updatedRole.name,
        description: updatedRole.description,
      });
      fetchRoles();
      setIsEditDialogOpen(false);
      setSelectedRole(null);
    } catch (err) {
      console.error('Failed to update role', err);
      setError('Failed to update role.');
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    try {
      await apiClient.delete(`/roles/${selectedRole.id}`);
      fetchRoles();
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
    } catch (err) {
      console.error('Failed to delete role', err);
      setError('Failed to delete role.');
    }
  };

  const handleMenuClick = (event: MouseEvent<HTMLElement>, role: Role) => {
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
    setAnchorEl(null);
    setIsDeleteDialogOpen(true);
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
                <TableCell>{role.description ?? '—'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label={`Manage options for role ${role.name}`}
                    onClick={(event) => handleMenuClick(event, role)}
                    id={`role-actions-${role.id}`}
                    aria-controls={openMenu && selectedRole?.id === role.id ? `role-menu-${role.id}` : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMenu && selectedRole?.id === role.id ? 'true' : undefined}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id={`role-menu-${role.id}`}
                    anchorEl={anchorEl}
                    open={openMenu && selectedRole?.id === role.id}
                    onClose={handleMenuClose}
                    MenuListProps={{ 'aria-labelledby': `role-actions-${role.id}` }}
                  >
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
        <EditRoleDialog
          open={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedRole(null);
          }}
          onUpdate={handleUpdateRole}
          role={selectedRole}
        />
      )}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        message={`Are you sure you want to delete ${selectedRole?.name}?`}
      />
    </Box>
  );
}
