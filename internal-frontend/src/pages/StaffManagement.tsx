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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import apiClient from '../api/client';
import ConfirmationDialog from '../components/ConfirmationDialog';
import AddStaffDialog from '../components/AddStaffDialog';
import EditStaffDialog from '../components/EditStaffDialog';
import type { Staff, StaffFormPayload } from '../types/hms';

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

  useEffect(() => {
    if (currentStaff) {
      const refreshed = staff.find((member) => member.id === currentStaff.id);
      if (refreshed) {
        setCurrentStaff(refreshed);
      }
    }
  }, [staff, currentStaff]);

  const handleAddStaff = async (newStaffData: StaffFormPayload) => {
    try {
      await apiClient.post(`/staff/`, newStaffData);
      fetchStaff();
    } catch (err) {
      setError('Failed to add staff member.');
      console.error(err);
    }
  };

  const handleEditStaff = async (updatedStaffData: StaffFormPayload) => {
    if (!currentStaff) return;
    try {
      await apiClient.put(`/staff/${currentStaff.id}`, updatedStaffData);
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

  const handleMenuClick = (event: MouseEvent<HTMLElement>, staffMember: Staff) => {
    setAnchorEl(event.currentTarget);
    setCurrentStaff(staffMember);
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
              <TableCell>Department</TableCell>
              <TableCell>Specialization</TableCell>
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
                <TableCell>{staffMember.department ?? '—'}</TableCell>
                <TableCell>{staffMember.specialization ?? '—'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label={`Manage options for staff member ${staffMember.first_name} ${staffMember.last_name}`}
                    onClick={(event) => handleMenuClick(event, staffMember)}
                    id={`staff-actions-${staffMember.id}`}
                    aria-controls={openMenu && currentStaff?.id === staffMember.id ? `staff-menu-${staffMember.id}` : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMenu && currentStaff?.id === staffMember.id ? 'true' : undefined}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id={`staff-menu-${staffMember.id}`}
                    anchorEl={anchorEl}
                    open={openMenu && currentStaff?.id === staffMember.id}
                    onClose={handleMenuClose}
                    MenuListProps={{ 'aria-labelledby': `staff-actions-${staffMember.id}` }}
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

      <AddStaffDialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onAdd={handleAddStaff} />
      {currentStaff && (
        <EditStaffDialog
          open={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setCurrentStaff(null);
          }}
          onEdit={handleEditStaff}
          staffMember={currentStaff}
        />
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
