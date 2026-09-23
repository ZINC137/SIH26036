import React, { useState } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Chip, Divider, Avatar,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton, Tooltip, Switch, FormControlLabel,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import StorageIcon from '@mui/icons-material/Storage';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DnsIcon from '@mui/icons-material/Dns';
import SpeedIcon from '@mui/icons-material/Speed';

const COLOR = '#B71C1C';
const GRADIENT = 'linear-gradient(135deg, #C62828, #B71C1C)';

const stats = [
  { label: 'Total Users', value: '1,284', icon: PeopleIcon, color: '#1565C0', bg: '#E3F2FD' },
  { label: 'Certificates Issued', value: '9,471', icon: VerifiedUserIcon, color: '#2E7D32', bg: '#E8F5E9' },
  { label: 'Applications Today', value: '143', icon: TrendingUpIcon, color: '#E65100', bg: '#FFF3E0' },
  { label: 'DB Size', value: '2.4 GB', icon: StorageIcon, color: '#6A1B9A', bg: '#F3E5F5' },
];

const users = [
  { name: 'Priya Sharma', email: 'priya@example.com', role: 'user', verified: true, joined: '10 Sep 2026', status: 'Active' },
  { name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'lmo', verified: true, joined: '05 Sep 2026', status: 'Active' },
  { name: 'Anjali Singh', email: 'anjali@example.com', role: 'field_officer', verified: true, joined: '01 Sep 2026', status: 'Active' },
  { name: 'Mohit Gupta', email: 'mohit@example.com', role: 'user', verified: false, joined: '20 Aug 2026', status: 'Unverified' },
  { name: 'Sunita Patel', email: 'sunita@example.com', role: 'user', verified: true, joined: '18 Aug 2026', status: 'Suspended' },
];

const roleColor = {
  user: { color: '#E65100', bg: '#FFF3E0' },
  lmo: { color: '#2E7D32', bg: '#E8F5E9' },
  field_officer: { color: '#4A148C', bg: '#F3E5F5' },
  admin: { color: '#B71C1C', bg: '#FFEBEE' },
};

const systemHealth = [
  { label: 'API Server', status: 'Online', uptime: '99.97%', color: '#2E7D32' },
  { label: 'Database', status: 'Online', uptime: '100%', color: '#2E7D32' },
  { label: 'Email Service', status: 'Online', uptime: '99.5%', color: '#2E7D32' },
  { label: 'File Storage', status: 'Degraded', uptime: '97.2%', color: '#E65100' },
];

export default function AdminDashboard({ userEmail }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>ADMINISTRATOR PORTAL</Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E', lineHeight: 1.2 }}>System Dashboard</Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>Super Admin — {userEmail}</Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              sx={{ '& .MuiSwitch-thumb': { bgcolor: maintenanceMode ? COLOR : '#BDBDBD' } }}
            />
          }
          label={<Typography variant="body2" sx={{ fontWeight: 600, color: maintenanceMode ? COLOR : '#757575' }}>Maintenance Mode</Typography>}
        />
      </Box>

      {maintenanceMode && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#FFEBEE', border: '1px solid #EF9A9A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BlockIcon sx={{ color: COLOR }} />
          <Typography variant="body2" sx={{ color: '#C62828', fontWeight: 600 }}>
            ⚠️ Maintenance mode is ON — public users cannot access the portal
          </Typography>
        </Paper>
      )}

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Grid item xs={6} md={3} key={s.label}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E0E0E0', bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                    <Icon />
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>{s.value}</Typography>
                <Typography variant="body2" sx={{ color: '#757575', fontWeight: 500 }}>{s.label}</Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3}>
        {/* Users Table */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon sx={{ color: COLOR }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>User Management</Typography>
              </Box>
              <Button size="small" variant="outlined" sx={{ borderColor: COLOR, color: COLOR, fontWeight: 600, borderRadius: 2 }}>
                Add User
              </Button>
            </Box>
            <Divider />
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                    {['User', 'Role', 'Email Verified', 'Joined', 'Status', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#424242' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.email} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, background: roleColor[u.role]?.bg, color: roleColor[u.role]?.color, fontSize: '0.75rem', fontWeight: 700 }}>
                            {u.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{u.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={u.role} size="small" sx={{ bgcolor: roleColor[u.role]?.bg, color: roleColor[u.role]?.color, fontWeight: 700, fontSize: '0.68rem' }} />
                      </TableCell>
                      <TableCell>
                        {u.verified
                          ? <CheckCircleIcon sx={{ color: '#2E7D32', fontSize: 18 }} />
                          : <BlockIcon sx={{ color: '#9E9E9E', fontSize: 18 }} />}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: '#757575' }}>{u.joined}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.status}
                          size="small"
                          sx={{
                            bgcolor: u.status === 'Active' ? '#E8F5E9' : u.status === 'Suspended' ? '#FFEBEE' : '#FFF8E1',
                            color: u.status === 'Active' ? '#2E7D32' : u.status === 'Suspended' ? '#B71C1C' : '#F57F17',
                            fontWeight: 700, fontSize: '0.68rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Edit Role">
                            <IconButton size="small" sx={{ color: '#1565C0', '&:hover': { bgcolor: '#E3F2FD' } }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Suspend">
                            <IconButton size="small" sx={{ color: '#B71C1C', '&:hover': { bgcolor: '#FFEBEE' } }}>
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpeedIcon sx={{ color: COLOR }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>System Health</Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>
              {systemHealth.map((s) => (
                <Box key={s.label} sx={{ p: 2, mb: 1.5, borderRadius: 2, bgcolor: '#FAFAFA', border: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E', lineHeight: 1 }}>{s.label}</Typography>
                      <Typography variant="caption" sx={{ color: s.color, fontWeight: 600 }}>{s.status}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#757575', fontWeight: 600 }}>↑ {s.uptime}</Typography>
                </Box>
              ))}

              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: '#F3E5F5', border: '1px solid #CE93D8' }}>
                <Typography variant="caption" sx={{ color: '#4A148C', fontWeight: 700 }}>📊 Platform Stats</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#616161', display: 'block' }}>Avg response time: <strong>142ms</strong></Typography>
                  <Typography variant="caption" sx={{ color: '#616161', display: 'block' }}>Active sessions: <strong>284</strong></Typography>
                  <Typography variant="caption" sx={{ color: '#616161', display: 'block' }}>Server uptime: <strong>99.97%</strong></Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
