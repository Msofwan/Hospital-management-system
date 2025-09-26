import { useState, useEffect } from 'react';
import { Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddPatientDialog from '../components/AddPatientDialog';
import EditPatientDialog from '../components/EditPatientDialog';
import ConfirmationDialog from '../components/ConfirmationDialog';
import axios from 'axios';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  contact_number: string;
  email: string;
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

export default function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPatient, setSelectedPatient] = useState<null | Patient>(null);

  const fetchPatients = async () => {
    try {
      const response = await apiClient.get('/patients/');
      setPatients(response.data);
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
      setPatients([]);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAddPatient = async (patient: Omit<Patient, 'id'>) => {
    try {
      await apiClient.post('/patients/', patient);
      setAddDialogOpen(false);
      fetchPatients();
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  const handleEditPatient = async (patient: Omit<Patient, 'id'>) => {
    if (selectedPatient) {
      try {
        await apiClient.put(`/patients/${selectedPatient.id}`, patient);
        setEditDialogOpen(false);
        setSelectedPatient(null);
        fetchPatients();
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
      }
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, patient: Patient) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    setEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPatient) {
      try {
        await apiClient.delete(`/patients/${selectedPatient.id}`);
        setConfirmDialogOpen(false);
        setSelectedPatient(null);
        fetchPatients();
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
      }
    }
  };

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Patient Management
      </Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setAddDialogOpen(true)}>
        Add Patient
      </Button>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow
                key={patient.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {patient.id}
                </TableCell>
                <TableCell>{patient.first_name}</TableCell>
                <TableCell>{patient.last_name}</TableCell>
                <TableCell>{patient.date_of_birth}</TableCell>
                <TableCell>{patient.contact_number}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label="more"
                    aria-controls="long-menu"
                    aria-haspopup="true"
                    onClick={(event) => handleMenuClick(event, patient)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
      </Menu>
      <AddPatientDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAddPatient={handleAddPatient}
      />
      <EditPatientDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onEditPatient={handleEditPatient}
        patient={selectedPatient}
      />
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient"
        message={`Are you sure you want to delete ${selectedPatient?.first_name} ${selectedPatient?.last_name}?`}
      />
    </div>
  );
}