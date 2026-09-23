import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, Avatar, Chip, Button, LinearProgress,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';

const COLOR = '#1B5E20';
const GRADIENT = 'linear-gradient(135deg, #2E7D32, #1B5E20)';

const OFFICERS = [
  { name: 'Suresh Verma', id: 'FO-001', phone: '9876500001', email: 'suresh@lm.gov.in', zone: 'North Delhi', assigned: 4, completed: 42, monthly: 15, target: 20, status: 'Active', joined: 'Jan 2024' },
  { name: 'Meena Sharma', id: 'FO-002', phone: '9876500002', email: 'meena@lm.gov.in', zone: 'South Delhi', assigned: 3, completed: 38, monthly: 17, target: 20, status: 'Active', joined: 'Mar 2024' },
  { name: 'Ramesh Kumar', id: 'FO-003', phone: '9876500003', email: 'ramesh@lm.gov.in', zone: 'West Delhi', assigned: 0, completed: 29, monthly: 0, target: 20, status: 'On Leave', joined: 'Jun 2023' },
  { name: 'Anita Patel', id: 'FO-004', phone: '9876500004', email: 'anita@lm.gov.in', zone: 'East Delhi', assigned: 2, completed: 51, monthly: 19, target: 20, status: 'Active', joined: 'Aug 2022' },
  { name: 'Vijay Singh', id: 'FO-005', phone: '9876500005', email: 'vijay@lm.gov.in', zone: 'Central Delhi', assigned: 5, completed: 21, monthly: 10, target: 20, status: 'Active', joined: 'Nov 2024' },
];

export default function LMOOfficers() {
  const [selected, setSelected] = useState(null);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>LMO PORTAL</Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>Field Officers</Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>{OFFICERS.filter(o => o.status === 'Active').length} active officers in your jurisdiction</Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAddIcon />}
          sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700, px: 3 }}>
          Add Officer
        </Button>
      </Box>

      <Grid container spacing={3}>
        {OFFICERS.map((o) => (
          <Grid item xs={12} md={6} lg={4} key={o.id}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${o.status === 'Active' ? '#C8E6C9' : '#FFE0B2'}`, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Avatar sx={{ width: 48, height: 48, background: GRADIENT, fontWeight: 700 }}>{o.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1A1A2E' }}>{o.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#757575' }}>{o.id} · {o.zone}</Typography>
                  </Box>
                </Box>
                <Chip label={o.status} size="small"
                  sx={{ bgcolor: o.status === 'Active' ? '#E8F5E9' : '#FFF3E0', color: o.status === 'Active' ? '#2E7D32' : '#E65100', fontWeight: 700, fontSize: '0.65rem' }} />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#757575' }}>Monthly Progress</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: COLOR }}>{o.monthly}/{o.target}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={(o.monthly / o.target) * 100}
                  sx={{ height: 6, borderRadius: 3, bgcolor: '#E8F5E9', '& .MuiLinearProgress-bar': { background: GRADIENT } }} />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ textAlign: 'center', flex: 1, p: 1, bgcolor: '#F9FBE7', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: COLOR }}>{o.assigned}</Typography>
                  <Typography variant="caption" sx={{ color: '#757575' }}>Assigned</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', flex: 1, p: 1, bgcolor: '#F9FBE7', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1565C0' }}>{o.completed}</Typography>
                  <Typography variant="caption" sx={{ color: '#757575' }}>Total Done</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={o.phone}><IconButton size="small" sx={{ bgcolor: '#E8F5E9', color: COLOR }}><CallIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title={o.email}><IconButton size="small" sx={{ bgcolor: '#E3F2FD', color: '#1565C0' }}><EmailIcon fontSize="small" /></IconButton></Tooltip>
                <Button size="small" startIcon={<AssignmentIcon />} onClick={() => setSelected(o)}
                  sx={{ ml: 'auto', color: COLOR, fontWeight: 600, fontSize: '0.78rem' }}>
                  Assign Task
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign Task — {selected?.name}</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Application ID" fullWidth size="small" placeholder="e.g. APP-2026-019" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Inspection Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Notes" fullWidth size="small" multiline rows={3} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setSelected(null)} sx={{ color: '#757575' }}>Cancel</Button>
          <Button variant="contained" sx={{ background: GRADIENT, fontWeight: 700 }} onClick={() => setSelected(null)}>Assign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
