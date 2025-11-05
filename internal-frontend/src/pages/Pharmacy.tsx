import type { ChangeEvent, SyntheticEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';

import apiClient from '../api/client';
import type { Medicine, Patient, PatientVisit, Prescription, StaffSummary } from '../types/hms';

// Interfaces
type PatientOption = {
  id: number;
  first_name: string;
  last_name: string;
};

interface Dispensation {
  id: number;
  patient: PatientOption;
  medicine: Medicine;
  staff: StaffSummary;
  quantity_dispensed: number;
  date_dispensed: string;
  notes?: string | null;
  prescription?: Prescription | null;
}

export default function Pharmacy() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
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
type NewMedicinePayload = {
  name: string;
  manufacturer: string;
  stock_quantity: number;
  unit_price: number;
};

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
            console.error('Failed to fetch medicines', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    const handleAddMedicine = async (newMedicineData: NewMedicinePayload) => {
        try {
            await apiClient.post('/medicines/', newMedicineData);
            fetchMedicines();
            setIsAddDialogOpen(false);
        } catch (err) {
            setError('Failed to add medicine.');
            console.error('Failed to add medicine', err);
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
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<number | ''>('');
  const [selectedMedicine, setSelectedMedicine] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<number | ''>('');
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  useEffect(() => {
    apiClient.get<Patient[]>('/patients/').then((res) => {
      const patientOptions = res.data.map((patient) => ({
        id: patient.id,
        first_name: patient.first_name,
        last_name: patient.last_name,
      }));
      setPatients(patientOptions);
    });
    apiClient.get<Medicine[]>('/medicines/').then((res) => setMedicines(res.data));
  }, []);

  useEffect(() => {
    if (!selectedPatient) {
      setPrescriptions([]);
      setSelectedPrescription('');
      return;
    }
    const fetchPrescriptions = async () => {
      try {
        setLoadingPrescriptions(true);
        const visitsResponse = await apiClient.get<PatientVisit[]>('/patient-visits/', {
          params: { patient_id: selectedPatient },
        });
        const prescriptionsForPatient = visitsResponse.data.flatMap((visit) => visit.prescriptions ?? []);
        setPrescriptions(prescriptionsForPatient);
        setSelectedPrescription('');
      } catch (err) {
        console.error('Failed to fetch prescriptions for patient', err);
        setPrescriptions([]);
      } finally {
        setLoadingPrescriptions(false);
      }
    };
    fetchPrescriptions();
  }, [selectedPatient]);

  const handleQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuantity(value ? Number(value) : '');
  };

  const handleDispense = async () => {
    if (!selectedPatient || !selectedMedicine || !quantity) {
      setError('Please fill all required fields.');
      return;
    }
    try {
      await apiClient.post('/dispensations/', {
        patient_id: selectedPatient,
        medicine_id: selectedMedicine,
        quantity_dispensed: quantity,
        notes: notes || undefined,
        prescription_id: selectedPrescription || undefined,
      });
      setSuccess('Medicine dispensed successfully!');
      setError(null);
      setSelectedPatient('');
      setSelectedMedicine('');
      setQuantity('');
      setNotes('');
      setSelectedPrescription('');
    } catch (err) {
      console.error('Failed to dispense medicine', err);
      setError('Failed to dispense medicine. Check stock levels.');
      setSuccess(null);
    }
  };

  const selectedPrescriptionDetails = useMemo(() => {
    if (!selectedPrescription) return null;
    return prescriptions.find((prescription) => prescription.id === selectedPrescription) ?? null;
  }, [selectedPrescription, prescriptions]);

  return (
    <Box sx={{ pt: 2, maxWidth: 520 }}>
      <FormControl fullWidth margin="normal">
        <InputLabel>Patient</InputLabel>
        <Select
          value={selectedPatient}
          label="Patient"
          onChange={(event) => setSelectedPatient(event.target.value as number)}
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

      <FormControl fullWidth margin="normal">
        <InputLabel>Medicine</InputLabel>
        <Select
          value={selectedMedicine}
          label="Medicine"
          onChange={(event) => setSelectedMedicine(event.target.value as number)}
        >
          <MenuItem value="" disabled>
            Select medicine
          </MenuItem>
          {medicines.map((medicine) => (
            <MenuItem key={medicine.id} value={medicine.id}>
              {medicine.name} (Stock: {medicine.stock_quantity})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" disabled={!selectedPatient || loadingPrescriptions}>
        <InputLabel>Prescription</InputLabel>
        <Select
          value={selectedPrescription}
          label="Prescription"
          onChange={(event) => setSelectedPrescription(event.target.value as number)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {prescriptions.map((prescription) => (
            <MenuItem key={prescription.id} value={prescription.id}>
              {prescription.medicine_name} — {prescription.dosage ?? 'dosage N/A'}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedPrescriptionDetails && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Instructions: {selectedPrescriptionDetails.instructions ?? '—'}
        </Typography>
      )}

      <TextField
        fullWidth
        margin="normal"
        label="Quantity"
        type="number"
        value={quantity}
        onChange={handleQuantityChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Notes"
        multiline
        rows={3}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <Button variant="contained" onClick={handleDispense} sx={{ mt: 2 }}>
        Dispense
      </Button>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {success && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          {success}
        </Typography>
      )}
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
                        <TableCell>Prescription</TableCell>
                        <TableCell>Dispensed By</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Notes</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dispensations.map(d => (
                        <TableRow key={d.id}>
                            <TableCell>{d.patient.first_name} {d.patient.last_name}</TableCell>
                            <TableCell>{d.medicine.name}</TableCell>
                            <TableCell>{d.quantity_dispensed}</TableCell>
                            <TableCell>{d.prescription ? d.prescription.medicine_name : '—'}</TableCell>
                            <TableCell>{d.staff ? `${d.staff.first_name} ${d.staff.last_name}` : '—'}</TableCell>
                            <TableCell>{format(new Date(d.date_dispensed), 'PPP p')}</TableCell>
                            <TableCell>{d.notes ?? '—'}</TableCell>
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
  onAdd: (data: NewMedicinePayload) => void;
}

function AddMedicineDialog({ open, onClose, onAdd }: AddMedicineDialogProps) {
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [stock, setStock] = useState<number | ''>('');
    const [price, setPrice] = useState<number | ''>('');

    useEffect(() => {
      if (!open) {
        setName('');
        setManufacturer('');
        setStock('');
        setPrice('');
      }
    }, [open]);

    const handleSubmit = () => {
        if (!name || !manufacturer || stock === '' || price === '') {
          return;
        }
        onAdd({
          name,
          manufacturer,
          stock_quantity: Number(stock),
          unit_price: Number(price),
        });
        setName('');
        setManufacturer('');
        setStock('');
        setPrice('');
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add New Medicine</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" label="Name" fullWidth value={name} onChange={e => setName(e.target.value)} />
                <TextField margin="dense" label="Manufacturer" fullWidth value={manufacturer} onChange={e => setManufacturer(e.target.value)} />
                <TextField
                  margin="dense"
                  label="Initial Stock"
                  type="number"
                  fullWidth
                  value={stock}
                  onChange={e => setStock(e.target.value ? Number(e.target.value) : '')}
                />
                <TextField
                  margin="dense"
                  label="Unit Price"
                  type="number"
                  fullWidth
                  value={price}
                  onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!name || !manufacturer || stock === '' || price === ''}>
                  Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}
