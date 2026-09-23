import React, { useState } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Button, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from 'react-router-dom';

const COLOR = '#E65100';
const GRADIENT = 'linear-gradient(135deg, #FF6D00, #E65100)';

const ALL_APPLICATIONS = [
  { id: 'APP-2026-001', instrument: 'Weighing Scale (50kg)', date: '15 Sep 2026', status: 'Approved', lmo: 'R. Sharma', expires: '15 Sep 2027' },
  { id: 'APP-2026-002', instrument: 'Platform Balance', date: '10 Sep 2026', status: 'Pending', lmo: '—', expires: '—' },
  { id: 'APP-2026-003', instrument: 'Fuel Dispenser', date: '05 Sep 2026', status: 'Under Inspection', lmo: 'M. Singh', expires: '—' },
  { id: 'APP-2026-004', instrument: 'Weighing Scale (100kg)', date: '01 Sep 2026', status: 'Approved', lmo: 'R. Sharma', expires: '01 Sep 2027' },
  { id: 'APP-2026-005', instrument: 'Moisture Meter', date: '22 Aug 2026', status: 'Rejected', lmo: 'A. Kumar', expires: '—' },
  { id: 'APP-2026-006', instrument: 'Counter Scale (5kg)', date: '10 Aug 2026', status: 'Approved', lmo: 'R. Sharma', expires: '10 Aug 2027' },
  { id: 'APP-2026-007', instrument: 'Pressure Gauge', date: '01 Aug 2026', status: 'Approved', lmo: 'M. Singh', expires: '01 Aug 2027' },
];

const statusColor = {
  Approved: { color: '#2E7D32', bg: '#E8F5E9' },
  Pending: { color: '#E65100', bg: '#FFF3E0' },
  'Under Inspection': { color: '#1565C0', bg: '#E3F2FD' },
  Rejected: { color: '#B71C1C', bg: '#FFEBEE' },
};

export default function UserApplications() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = ALL_APPLICATIONS.filter(a =>
    (filter === 'All' || a.status === filter) &&
    (a.instrument.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>USER PORTAL</Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>My Applications</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddCircleIcon />}
          onClick={() => navigate('/dashboard/user/apply')}
          sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700, px: 3 }}>
          New Application
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by ID or instrument..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
          sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filter} label="Status" onChange={(e) => setFilter(e.target.value)} sx={{ borderRadius: 2 }}>
            {['All', 'Approved', 'Pending', 'Under Inspection', 'Rejected'].map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Chip label={`${filtered.length} results`} sx={{ bgcolor: '#F5F5F5', fontWeight: 600, alignSelf: 'center' }} />
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                {['Application ID', 'Instrument', 'Submitted', 'LMO Assigned', 'Status', 'Cert. Expiry', 'Action'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#424242', fontSize: '0.8rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((app) => (
                <TableRow key={app.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: COLOR, fontSize: '0.8rem' }}>{app.id}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{app.instrument}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem', color: '#757575' }}>{app.date}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem', color: '#616161' }}>{app.lmo}</TableCell>
                  <TableCell>
                    <Chip label={app.status} size="small"
                      sx={{ bgcolor: statusColor[app.status]?.bg, color: statusColor[app.status]?.color, fontWeight: 700, fontSize: '0.72rem' }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.82rem', color: '#757575' }}>{app.expires}</TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<VisibilityIcon />} sx={{ color: '#1565C0', fontSize: '0.75rem', fontWeight: 600 }}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#9E9E9E' }}>No applications found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}
