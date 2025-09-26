import React, { useState, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Button,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HotelIcon from '@mui/icons-material/Hotel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Routes, Route, Link, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PatientManagement from './pages/PatientManagement';
import Appointments from './pages/Appointments';
import BedManagement from './pages/BedManagement';
import Billing from './pages/Billing';
import StaffManagement from './pages/StaffManagement';
import RoleManagement from './pages/RoleManagement';
import Pharmacy from './pages/Pharmacy';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const drawerWidth = 240;

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

const allMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['Admin', 'Doctor', 'Nurse', 'Pharmacist'] },
  { text: 'Patient Management', icon: <PeopleIcon />, path: '/patients', roles: ['Admin', 'Nurse'] },
  { text: 'Staff Management', icon: <SupervisedUserCircleIcon />, path: '/staff', roles: ['Admin'] },
  { text: 'Role Management', icon: <VpnKeyIcon />, path: '/roles', roles: ['Admin'] },
  { text: 'Appointments', icon: <CalendarTodayIcon />, path: '/appointments', roles: ['Admin', 'Doctor'] },
  { text: 'Bed Management', icon: <HotelIcon />, path: '/beds', roles: ['Admin', 'Nurse'] },
  { text: 'Billing', icon: <ReceiptIcon />, path: '/billing', roles: ['Admin'] },
  { text: 'Pharmacy', icon: <LocalPharmacyIcon />, path: '/pharmacy', roles: ['Admin', 'Pharmacist'] },
];

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  const userRole = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.role;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  }, [token]);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  if (!token || !userRole) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const filteredMenuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Hospital Management - Internal Dashboard
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {filteredMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.path}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<PatientManagement />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/beds" element={<BedManagement />} />
            <Route path="/billing" element={<Billing />} />
            {userRole === 'Admin' && (
              <>
                <Route path="/staff" element={<StaffManagement />} />
                <Route path="/roles" element={<RoleManagement />} />
                <Route path="/pharmacy" element={<Pharmacy />} />
              </>
            )}
            {userRole === 'Pharmacist' && <Route path="/pharmacy" element={<Pharmacy />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LocalizationProvider>
      </Box>
    </Box>
  );
}

export default App;