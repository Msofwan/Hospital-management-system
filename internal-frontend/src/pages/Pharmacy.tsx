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
  MenuItem,
  Tabs,
  Tab
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

interface Medicine {
  id: number;
  name: string;
  manufacturer: string;
  stock_quantity: number;
  unit_price: number;
}

interface Dispensation {
    id: number;
    patient: Patient;
    medicine: Medicine;
    quantity_dispensed: number;
    date_dispensed: string;
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

export default function Pharmacy() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>Pharmacy</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabIndex} onChange={handleTabChange} aria-label="pharmacy tabs">
                <Tab label="Inventory" />
                <Tab label="Dispense" />
                <Tab label="History" />
            </Tabs>
        </Box>
        {tabIndex === 0 && <InventoryTab />}
        {tabIndex === 1 && <DispenseTab />}
        {tabIndex === 2 && <HistoryTab />}
    </Box>
  );
}

// InventoryTab Component
function InventoryTab() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<Medicine[]>('/medicines/');
            setMedicines(response.data);
        } catch (err) {
            setError('Failed to fetch medicines.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    const handleAddMedicine = async (newMedicineData: any) => {
        try {
            await apiClient.post('/medicines/', newMedicineData);
            fetchMedicines();
            setIsAddDialogOpen(false);
        } catch (err) {
            setError('Failed to add medicine.');
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ pt: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddDialogOpen(true)} sx={{ mb: 2 }}>
                Add New Medicine
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Manufacturer</TableCell>
                            <TableCell>Stock Quantity</TableCell>
                            <TableCell>Unit Price</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {medicines.map((med) => (
                            <TableRow key={med.id}>
                                <TableCell>{med.name}</TableCell>
                                <TableCell>{med.manufacturer}</TableCell>
                                <TableCell>{med.stock_quantity}</TableCell>
                                <TableCell>${med.unit_price.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <AddMedicineDialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onAdd={handleAddMedicine} />
        </Box>
    );
}

// DispenseTab Component
function DispenseTab() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<number | ''>('');
    const [selectedMedicine, setSelectedMedicine] = useState<number | ''>('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        apiClient.get('/patients/').then(res => setPatients(res.data));
        apiClient.get('/medicines/').then(res => setMedicines(res.data));
    }, []);

    const handleDispense = async () => {
        if (!selectedPatient || !selectedMedicine || !quantity) {
            setError('Please fill all fields.');
            return;
        }
        try {
            await apiClient.post('/dispensations/', {
                patient_id: selectedPatient,
                medicine_id: selectedMedicine,
                quantity_dispensed: quantity,
                notes
            });
            setSuccess('Medicine dispensed successfully!');
            setError(null);
            // Reset form
            setSelectedPatient('');
            setSelectedMedicine('');
            setQuantity('');
            setNotes('');
        } catch (err) {
            setError('Failed to dispense medicine. Check stock.');
            setSuccess(null);
        }
    };

    return (
        <Box sx={{ pt: 2, maxWidth: 500 }}>
            <FormControl fullWidth margin="normal">
                <InputLabel>Patient</InputLabel>
                <Select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value as number)}>
                    {patients.map(p => <MenuItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
                <InputLabel>Medicine</InputLabel>
                <Select value={selectedMedicine} onChange={(e) => setSelectedMedicine(e.target.value as number)}>
                    {medicines.map(m => <MenuItem key={m.id} value={m.id}>{m.name} (Stock: {m.stock_quantity})</MenuItem>)}
                </Select>
            </FormControl>
            <TextField fullWidth margin="normal" label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            <TextField fullWidth margin="normal" label="Notes" multiline rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button variant="contained" onClick={handleDispense} sx={{ mt: 2 }}>Dispense</Button>
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            {success && <Typography color="success.main" sx={{ mt: 2 }}>{success}</Typography>}
        </Box>
    );
}

// HistoryTab Component
function HistoryTab() {
    const [dispensations, setDispensations] = useState<Dispensation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiClient.get<Dispensation[]>('/dispensations/')
            .then(res => setDispensations(res.data))
            .catch(() => setError('Failed to fetch history.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Patient</TableCell>
                        <TableCell>Medicine</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dispensations.map(d => (
                        <TableRow key={d.id}>
                            <TableCell>{d.patient.first_name} {d.patient.last_name}</TableCell>
                            <TableCell>{d.medicine.name}</TableCell>
                            <TableCell>{d.quantity_dispensed}</TableCell>
                            <TableCell>{format(new Date(d.date_dispensed), 'PPP p')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

// AddMedicineDialog Component
interface AddMedicineDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

function AddMedicineDialog({ open, onClose, onAdd }: AddMedicineDialogProps) {
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [stock, setStock] = useState<number | ''>('');
    const [price, setPrice] = useState<number | ''>('');

    const handleSubmit = () => {
        onAdd({ name, manufacturer, stock_quantity: stock, unit_price: price });
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add New Medicine</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" label="Name" fullWidth value={name} onChange={e => setName(e.target.value)} />
                <TextField margin="dense" label="Manufacturer" fullWidth value={manufacturer} onChange={e => setManufacturer(e.target.value)} />
                <TextField margin="dense" label="Initial Stock" type="number" fullWidth value={stock} onChange={e => setStock(Number(e.target.value))} />
                <TextField margin="dense" label="Unit Price" type="number" fullWidth value={price} onChange={e => setPrice(Number(e.target.value))} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Add</Button>
            </DialogActions>
        </Dialog>
    );
}
