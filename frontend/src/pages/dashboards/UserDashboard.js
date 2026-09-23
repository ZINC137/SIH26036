import React from 'react';
import {
  Box, Grid, Paper, Typography, Button, Chip, Avatar,
  Table, TableBody, TableCell, TableHead, TableRow, LinearProgress, Divider,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DownloadIcon from '@mui/icons-material/Download';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';

const COLOR = '#E65100';
const GRADIENT = 'linear-gradient(135deg, #FF6D00, #E65100)';

const stats = [
  { label: 'Total Applications', value: '12', icon: <AssignmentIcon />, color: '#1565C0', bg: '#E3F2FD' },
  { label: 'Approved', value: '8', icon: <CheckCircleIcon />, color: '#2E7D32', bg: '#E8F5E9' },
  { label: 'Pending Review', value: '3', icon: <HourglassEmptyIcon />, color: '#E65100', bg: '#FFF3E0' },
  { label: 'Certificates', value: '6', icon: <DownloadIcon />, color: '#6A1B9A', bg: '#F3E5F5' },
];

const applications = [
  { id: 'APP-2026-001', instrument: 'Weighing Scale (50kg)', date: '15 Sep 2026', status: 'Approved', expires: '15 Sep 2027' },
  { id: 'APP-2026-002', instrument: 'Platform Balance', date: '10 Sep 2026', status: 'Pending', expires: '—' },
  { id: 'APP-2026-003', instrument: 'Fuel Dispenser', date: '05 Sep 2026', status: 'Under Inspection', expires: '—' },
  { id: 'APP-2026-004', instrument: 'Weighing Scale (100kg)', date: '01 Sep 2026', status: 'Approved', expires: '01 Sep 2027' },
  { id: 'APP-2026-005', instrument: 'Moisture Meter', date: '22 Aug 2026', status: 'Rejected', expires: '—' },
];

const statusColor = {
  Approved: { color: '#2E7D32', bg: '#E8F5E9' },
  Pending: { color: '#E65100', bg: '#FFF3E0' },
  'Under Inspection': { color: '#1565C0', bg: '#E3F2FD' },
  Rejected: { color: '#B71C1C', bg: '#FFEBEE' },
};

function StatCard({ label, value, icon, color, bg }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E0E0E0', bgcolor: 'white', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>{value}</Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#757575', fontWeight: 500 }}>{label}</Typography>
    </Paper>
  );
}

export default function UserDashboard({ userEmail }) {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>PUBLIC USER PORTAL</Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E', lineHeight: 1.2 }}>My Dashboard</Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>Welcome back, {userEmail}</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => navigate('/dashboard/user/apply')}
          sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700, px: 3, py: 1.2, boxShadow: '0 4px 16px #E6510044' }}
        >
          New Application
        </Button>
      </Box>

      {/* Alert */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#FFF8E1', border: '1px solid #FFD54F', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <WarningAmberIcon sx={{ color: '#F9A825' }} />
        <Typography variant="body2" sx={{ color: '#795548' }}>
          <strong>Reminder:</strong> Certificate for <em>Weighing Scale (100kg)</em> expires in <strong>8 days</strong>. Apply for re-verification soon.
        </Typography>
      </Paper>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid item xs={6} md={3} key={s.label}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* Applications Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A2E' }}>My Applications</Typography>
          <Chip label="All Time" size="small" sx={{ bgcolor: '#F5F5F5' }} />
        </Box>
        <Divider />
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                {['Application ID', 'Instrument', 'Submitted', 'Status', 'Certificate Expiry', 'Action'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#424242', fontSize: '0.8rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id} hover>
                  <TableCell sx={{ fontWeight: 600, color: COLOR, fontSize: '0.8rem' }}>{app.id}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{app.instrument}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: '#757575' }}>{app.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={app.status}
                      size="small"
                      sx={{ bgcolor: statusColor[app.status]?.bg, color: statusColor[app.status]?.color, fontWeight: 600, fontSize: '0.72rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: '#757575' }}>{app.expires}</TableCell>
                  <TableCell>
                    {app.status === 'Approved' && (
                      <Button size="small" startIcon={<DownloadIcon />} sx={{ color: COLOR, fontWeight: 600, fontSize: '0.75rem' }}>
                        Download
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}
