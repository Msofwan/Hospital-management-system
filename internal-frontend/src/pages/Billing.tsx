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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';

import apiClient from '../api/client';
import type { InvoiceDetail, InvoicePayload, Patient } from '../types/hms';

export default function Billing() {
  const [invoices, setInvoices] = useState<InvoiceDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<InvoiceDetail[]>('/invoices/');
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

  const handleAddInvoice = async (newInvoiceData: InvoicePayload) => {
    try {
      await apiClient.post('/invoices/', newInvoiceData);
      fetchInvoices();
      setIsAddDialogOpen(false);
    } catch (err) {
      setError('Failed to add invoice.');
      console.error('Failed to add invoice', err);
    }
  };

  const handleStatusChange = async (invoiceId: number, newStatus: string) => {
    try {
      await apiClient.put(`/invoices/${invoiceId}/status`, { status: newStatus });
      fetchInvoices();
    } catch (err) {
      setError('Failed to update status.');
      console.error('Failed to update invoice status', err);
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

interface AddInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (payload: InvoicePayload) => void;
}

function AddInvoiceDialog({ open, onClose, onAdd }: AddInvoiceDialogProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientId, setPatientId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoadingPatients(true);
    apiClient.get<Patient[]>('/patients/')
      .then((response) => setPatients(response.data))
      .catch((error) => console.error('Failed to fetch patients', error))
      .finally(() => setLoadingPatients(false));
  }, [open]);

  const handleSubmit = () => {
    if (!patientId || !amount || !description) return;
    const payload: InvoicePayload = {
      patient_id: Number(patientId),
      amount: Number(amount),
      description,
      status: 'Unpaid',
      date_issued: new Date().toISOString(),
    };
    onAdd(payload);
  };

  const resetAndClose = () => {
    setPatientId('');
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={resetAndClose} fullWidth maxWidth="sm">
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
              onChange={(event: SelectChangeEvent<number>) => setPatientId(event.target.value as number)}
            >
              <MenuItem value="" disabled>
                Select patient
              </MenuItem>
              {patients.map((patient) => (
                <MenuItem key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <TextField margin="dense" label="Amount" type="number" fullWidth value={amount} onChange={(event) => setAmount(event.target.value)} />
        <TextField margin="dense" label="Description" type="text" fullWidth multiline rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAndClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!patientId || !amount || !description}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}