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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import ConfirmationDialog from '../components/ConfirmationDialog';
// We will create these dialogs next
import AddStaffDialog from '../components/AddStaffDialog';
import EditStaffDialog from '../components/EditStaffDialog';

interface Role {
  id: number;
  name: string;
}

interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  role: Role;
  email: string;
  contact_number: string;
}

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({ baseURL: API_BASE_URL });
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Staff[]>(`/staff/`);
      setStaff(response.data);
    } catch (err) {
      setError('Failed to fetch staff.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (newStaffData: Omit<Staff, 'id'>) => {
    try {
      // The backend expects role_id, not a role object.
      const payload = {
        ...newStaffData,
        role_id: newStaffData.role.id,
      };
      await apiClient.post(`/staff/`, payload);
      fetchStaff();
    } catch (err) {
      setError('Failed to add staff member.');
      console.error(err);
    }
  };

  const handleEditStaff = async (updatedStaffData: Staff) => {
    if (!currentStaff) return;
    try {
      // The backend expects role_id, not a role object.
      const payload = {
        ...updatedStaffData,
        role_id: updatedStaffData.role.id,
      };
      await apiClient.put(`/staff/${currentStaff.id}`, payload);
      fetchStaff();
    } catch (err) {
      setError('Failed to update staff member.');
      console.error(err);
    }
  };

  const handleDeleteStaff = async () => {
    if (!currentStaff) return;
    try {
      await apiClient.delete(`/staff/${currentStaff.id}`);
      fetchStaff();
    } catch (err) {
      setError('Failed to delete staff member.');
      console.error(err);
    } finally {
      setIsDeleteDialogOpen(false);
      setCurrentStaff(null);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, staffMember: Staff) => {
    setAnchorEl(event.currentTarget);
    setCurrentStaff(staffMember);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentStaff(null);
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
        <Typography variant="h4" component="h1">Staff Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddDialogOpen(true)}>Add Staff</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((staffMember) => (
              <TableRow key={staffMember.id}>
                <TableCell>{staffMember.id}</TableCell>
                <TableCell>{`${staffMember.first_name} ${staffMember.last_name}`}</TableCell>
                <TableCell>{staffMember.role ? staffMember.role.name : ''}</TableCell>
                <TableCell>{staffMember.email}</TableCell>
                <TableCell>{staffMember.contact_number}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={(event) => handleMenuClick(event, staffMember)}><MoreVertIcon /></IconButton>
                  <Menu anchorEl={anchorEl} open={openMenu && currentStaff?.id === staffMember.id} onClose={handleMenuClose}>
                    <MenuItem onClick={handleEditClick}><EditIcon sx={{ mr: 1 }} /> Edit</MenuItem>
                    <MenuItem onClick={handleDeleteClick}><DeleteIcon sx={{ mr: 1 }} /> Delete</MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AddStaffDialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onAdd={handleAddStaff} />
      {currentStaff && (
        <EditStaffDialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} onEdit={handleEditStaff} staffMember={currentStaff} />
      )}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setCurrentStaff(null); }}
        onConfirm={handleDeleteStaff}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${currentStaff?.first_name} ${currentStaff?.last_name}?`}
      />
    </Box>
  );
}
