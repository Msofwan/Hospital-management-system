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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import axios from 'axios';

// Interfaces
interface Patient {
  id: number;
  first_name: string;
  last_name: string;
}

interface Invoice {
  id: number;
  patient_id: number;
  amount: number;
  description: string;
  date_issued: string;
  status: string;
  patient: Patient;
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

export default function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Invoice[]>('/invoices/');
      setInvoices(response.data);
    } catch (err) {
      setError('Failed to fetch invoices.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleAddInvoice = async (newInvoiceData: any) => {
    try {
      await apiClient.post('/invoices/', newInvoiceData);
      fetchInvoices();
      setIsAddDialogOpen(false);
    } catch (err) {
      setError('Failed to add invoice.');
      console.error(err);
    }
  };

  const handleStatusChange = async (invoiceId: number, newStatus: string) => {
    try {
      await apiClient.put(`/invoices/${invoiceId}/status`, { status: newStatus });
      fetchInvoices();
    } catch (err) {
      setError('Failed to update status.');
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
        <Typography variant="h4" component="h1">Billing</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddDialogOpen(true)}>Create Invoice</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice ID</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date Issued</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{`${invoice.patient.first_name} ${invoice.patient.last_name}`}</TableCell>
                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                <TableCell>{invoice.description}</TableCell>
                <TableCell>{format(new Date(invoice.date_issued), 'PPP')}</TableCell>
                <TableCell>
                  <Chip 
                    label={invoice.status} 
                    color={invoice.status === 'Paid' ? 'success' : 'warning'} 
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  {invoice.status === 'Unpaid' && (
                    <Button variant="outlined" size="small" onClick={() => handleStatusChange(invoice.id, 'Paid')}>
                      Mark as Paid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AddInvoiceDialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onAdd={handleAddInvoice} />
    </Box>
  );
}

// AddInvoiceDialog Component
interface AddInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (invoiceData: any) => void;
}

function AddInvoiceDialog({ open, onClose, onAdd }: AddInvoiceDialogProps) {
  const [patientId, setPatientId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  useEffect(() => {
    if (open) {
      setPatientId('');
      setAmount('');
      setDescription('');
      
      setLoadingPatients(true);
      apiClient.get<Patient[]>('/patients/')
        .then(response => setPatients(response.data))
        .catch(error => console.error("Failed to fetch patients", error))
        .finally(() => setLoadingPatients(false));
    }
  }, [open]);

  const handleSubmit = () => {
    if (patientId && amount && description) {
      onAdd({ patient_id: patientId, amount: parseFloat(amount), description });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Invoice</DialogTitle>
      <DialogContent>
        {loadingPatients ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>
        ) : (
          <FormControl fullWidth margin="dense">
            <InputLabel id="patient-select-label">Patient</InputLabel>
            <Select
              labelId="patient-select-label"
              value={patientId}
              label="Patient"
              onChange={(e: SelectChangeEvent<number>) => setPatientId(e.target.value as number)}
            >
              {patients.map(p => (
                <MenuItem key={p.id} value={p.id}>{`${p.first_name} ${p.last_name}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <TextField margin="dense" label="Amount" type="number" fullWidth value={amount} onChange={(e) => setAmount(e.target.value)} />
        <TextField margin="dense" label="Description" type="text" fullWidth multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Create</Button>
      </DialogActions>
    </Dialog>
  );
}