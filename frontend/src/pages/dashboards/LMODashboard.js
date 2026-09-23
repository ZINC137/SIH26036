import React, { useState } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Chip, Divider, Avatar,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton, Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import VerifiedIcon from '@mui/icons-material/Verified';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityIcon from '@mui/icons-material/Visibility';

const COLOR = '#1B5E20';
const GRADIENT = 'linear-gradient(135deg, #2E7D32, #1B5E20)';

const stats = [
  { label: 'Pending Review', value: '24', color: '#E65100', bg: '#FFF3E0' },
  { label: 'Approved This Month', value: '87', color: '#2E7D32', bg: '#E8F5E9' },
  { label: 'Field Inspections', value: '13', color: '#1565C0', bg: '#E3F2FD' },
  { label: 'Officers Under You', value: '6', color: '#6A1B9A', bg: '#F3E5F5' },
];

const applications = [
  { id: 'APP-2026-019', applicant: 'Raj Traders', instrument: 'Platform Balance (200kg)', submitted: '20 Sep 2026', priority: 'High', status: 'Pending' },
  { id: 'APP-2026-018', applicant: 'Gupta Mart', instrument: 'Weighing Scale (50kg)', submitted: '19 Sep 2026', priority: 'Normal', status: 'Pending' },
  { id: 'APP-2026-017', applicant: 'Singh Fuels', instrument: 'Fuel Dispenser', submitted: '18 Sep 2026', priority: 'High', status: 'Under Inspection' },
  { id: 'APP-2026-016', applicant: 'Patel Agro', instrument: 'Moisture Meter', submitted: '17 Sep 2026', priority: 'Normal', status: 'Pending' },
  { id: 'APP-2026-015', applicant: 'Kumar Stores', instrument: 'Counter Scale (5kg)', submitted: '16 Sep 2026', priority: 'Low', status: 'Pending' },
];

const officers = [
  { name: 'Suresh Verma', id: 'FO-001', assigned: 4, completed: 12, status: 'Active' },
  { name: 'Meena Sharma', id: 'FO-002', assigned: 3, completed: 9, status: 'Active' },
  { name: 'Ramesh Kumar', id: 'FO-003', assigned: 2, completed: 7, status: 'On Leave' },
];

const priorityColor = { High: { color: '#B71C1C', bg: '#FFEBEE' }, Normal: { color: '#1565C0', bg: '#E3F2FD' }, Low: { color: '#2E7D32', bg: '#E8F5E9' } };
const statusColor = { Pending: { color: '#E65100', bg: '#FFF3E0' }, 'Under Inspection': { color: '#1565C0', bg: '#E3F2FD' } };

export default function LMODashboard({ userEmail }) {
  const [applications2, setApplications2] = useState(applications);

  const handleAction = (id, action) => {
    setApplications2(prev => prev.map(a => a.id === id ? { ...a, status: action === 'approve' ? 'Approved' : 'Rejected' } : a));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>LMO OFFICER PORTAL</Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E', lineHeight: 1.2 }}>Officer Dashboard</Typography>
        <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>Jurisdiction: Delhi North — {userEmail}</Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid item xs={6} md={3} key={s.label}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E0E0E0', bgcolor: 'white' }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: s.color }}>{s.value}</Typography>
              <Typography variant="body2" sx={{ color: '#757575', mt: 0.5, fontWeight: 500 }}>{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Pending Applications Queue */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PendingActionsIcon sx={{ color: COLOR }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Pending Applications</Typography>
              </Box>
              <Chip label="Action Required" size="small" sx={{ bgcolor: '#FFEBEE', color: '#B71C1C', fontWeight: 700 }} />
            </Box>
            <Divider />
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                    {['ID', 'Applicant', 'Instrument', 'Priority', 'Status', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, color: '#424242', fontSize: '0.8rem' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications2.map(app => (
                    <TableRow key={app.id} hover>
                      <TableCell sx={{ fontWeight: 600, color: COLOR, fontSize: '0.8rem' }}>{app.id}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{app.applicant}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: '#616161' }}>{app.instrument}</TableCell>
                      <TableCell>
                        <Chip label={app.priority} size="small" sx={{ bgcolor: priorityColor[app.priority]?.bg, color: priorityColor[app.priority]?.color, fontWeight: 700, fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={app.status} size="small" sx={{ bgcolor: statusColor[app.status]?.bg || '#E8F5E9', color: statusColor[app.status]?.color || '#2E7D32', fontWeight: 600, fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell>
                        {(app.status === 'Pending' || app.status === 'Under Inspection') && (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Approve">
                              <IconButton size="small" onClick={() => handleAction(app.id, 'approve')} sx={{ color: '#2E7D32', '&:hover': { bgcolor: '#E8F5E9' } }}>
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton size="small" onClick={() => handleAction(app.id, 'reject')} sx={{ color: '#B71C1C', '&:hover': { bgcolor: '#FFEBEE' } }}>
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Details">
                              <IconButton size="small" sx={{ color: '#1565C0', '&:hover': { bgcolor: '#E3F2FD' } }}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>

        {/* Field Officers Panel */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon sx={{ color: COLOR }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Field Officers</Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>
              {officers.map((o) => (
                <Box key={o.id} sx={{ p: 2, mb: 1.5, borderRadius: 2, bgcolor: '#F9FBE7', border: '1px solid #C5E1A5' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: COLOR, fontSize: '0.75rem', fontWeight: 700 }}>
                        {o.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E', lineHeight: 1 }}>{o.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#757575' }}>{o.id}</Typography>
                      </Box>
                    </Box>
                    <Chip label={o.status} size="small" sx={{ bgcolor: o.status === 'Active' ? '#E8F5E9' : '#FFF3E0', color: o.status === 'Active' ? '#2E7D32' : '#E65100', fontWeight: 600, fontSize: '0.65rem' }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="caption" sx={{ color: '#616161' }}>Assigned: <strong>{o.assigned}</strong></Typography>
                    <Typography variant="caption" sx={{ color: '#616161' }}>Completed: <strong>{o.completed}</strong></Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
