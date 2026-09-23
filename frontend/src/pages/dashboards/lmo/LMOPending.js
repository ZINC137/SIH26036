import React, { useState } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Button, TextField, InputAdornment, Select, FormControl, InputLabel,
  MenuItem, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import VisibilityIcon from '@mui/icons-material/Visibility';

const COLOR = '#1B5E20';
const GRADIENT = 'linear-gradient(135deg, #2E7D32, #1B5E20)';

const QUEUE = [
  { id: 'APP-2026-019', applicant: 'Raj Traders', contact: '9876543210', instrument: 'Platform Balance (200kg)', submitted: '20 Sep 2026', priority: 'High', status: 'Pending' },
  { id: 'APP-2026-018', applicant: 'Gupta Mart', contact: '9123456789', instrument: 'Weighing Scale (50kg)', submitted: '19 Sep 2026', priority: 'Normal', status: 'Pending' },
  { id: 'APP-2026-017', applicant: 'Singh Fuels', contact: '9012345678', instrument: 'Fuel Dispenser', submitted: '18 Sep 2026', priority: 'High', status: 'Under Inspection' },
  { id: 'APP-2026-016', applicant: 'Patel Agro', contact: '8901234567', instrument: 'Moisture Meter', submitted: '17 Sep 2026', priority: 'Normal', status: 'Pending' },
  { id: 'APP-2026-015', applicant: 'Kumar Stores', contact: '8800123456', instrument: 'Counter Scale (5kg)', submitted: '16 Sep 2026', priority: 'Low', status: 'Pending' },
  { id: 'APP-2026-014', applicant: 'Mehta Steel', contact: '7700123456', instrument: 'Crane Scale (2T)', submitted: '15 Sep 2026', priority: 'High', status: 'Pending' },
  { id: 'APP-2026-013', applicant: 'Verma Pharma', contact: '9900112233', instrument: 'Precision Balance', submitted: '14 Sep 2026', priority: 'Normal', status: 'Pending' },
];

const priorityColor = { High: { color: '#B71C1C', bg: '#FFEBEE' }, Normal: { color: '#1565C0', bg: '#E3F2FD' }, Low: { color: '#2E7D32', bg: '#E8F5E9' } };
const statusColor = { Pending: { color: '#E65100', bg: '#FFF3E0' }, 'Under Inspection': { color: '#1565C0', bg: '#E3F2FD' }, Approved: { color: '#2E7D32', bg: '#E8F5E9' }, Rejected: { color: '#B71C1C', bg: '#FFEBEE' } };

export default function LMOPending() {
  const [apps, setApps] = useState(QUEUE);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('All');
  const [selected, setSelected] = useState(null);

  const handleAction = (id, action) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: action === 'approve' ? 'Approved' : 'Rejected' } : a));
    setSelected(null);
  };

  const filtered = apps.filter(a =>
    (priority === 'All' || a.priority === priority) &&
    (a.applicant.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search))
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>LMO PORTAL</Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>Pending Applications Queue</Typography>
        <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>
          {apps.filter(a => a.status === 'Pending').length} applications awaiting your review
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by ID or applicant..."
          size="small" value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
          sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value)} sx={{ borderRadius: 2 }}>
            {['All', 'High', 'Normal', 'Low'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                {['App ID', 'Applicant', 'Instrument', 'Submitted', 'Priority', 'Status', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#424242', fontSize: '0.8rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((app) => (
                <TableRow key={app.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: COLOR, fontSize: '0.8rem' }}>{app.id}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{app.applicant}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#616161' }}>{app.instrument}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#757575' }}>{app.submitted}</TableCell>
                  <TableCell>
                    <Chip label={app.priority} size="small" sx={{ bgcolor: priorityColor[app.priority]?.bg, color: priorityColor[app.priority]?.color, fontWeight: 700, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={app.status} size="small" sx={{ bgcolor: statusColor[app.status]?.bg, color: statusColor[app.status]?.color, fontWeight: 600, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details"><IconButton size="small" onClick={() => setSelected(app)} sx={{ color: '#1565C0' }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                      {(app.status === 'Pending' || app.status === 'Under Inspection') && (
                        <>
                          <Tooltip title="Approve"><IconButton size="small" onClick={() => handleAction(app.id, 'approve')} sx={{ color: '#2E7D32' }}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Reject"><IconButton size="small" onClick={() => handleAction(app.id, 'reject')} sx={{ color: '#B71C1C' }}><CancelIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Assign Officer"><IconButton size="small" sx={{ color: '#4A148C' }}><AssignmentIndIcon fontSize="small" /></IconButton></Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Application Details — {selected?.id}</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[['Applicant', selected.applicant], ['Contact', selected.contact], ['Instrument', selected.instrument], ['Submitted', selected.submitted], ['Priority', selected.priority], ['Status', selected.status]].map(([k, v]) => (
                <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#757575' }}>{k}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{v}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setSelected(null)} sx={{ color: '#757575' }}>Close</Button>
          <Button onClick={() => handleAction(selected?.id, 'reject')} variant="outlined" color="error" sx={{ fontWeight: 700 }}>Reject</Button>
          <Button onClick={() => handleAction(selected?.id, 'approve')} variant="contained" sx={{ background: GRADIENT, fontWeight: 700 }}>Approve</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
