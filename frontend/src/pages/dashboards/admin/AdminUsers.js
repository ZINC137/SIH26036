import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Button, Avatar, IconButton, Tooltip, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const COLOR = '#B71C1C';
const GRADIENT = 'linear-gradient(135deg, #C62828, #B71C1C)';

const ALL_USERS = [
  { name: 'Admin User', email: 'admin@example.com', role: 'admin', verified: true, joined: '14 Sep 2026', status: 'Active' },
  { name: 'Priya Sharma', email: 'priya@example.com', role: 'user', verified: true, joined: '10 Sep 2026', status: 'Active' },
  { name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'lmo', verified: true, joined: '05 Sep 2026', status: 'Active' },
  { name: 'Anjali Singh', email: 'anjali@example.com', role: 'field_officer', verified: true, joined: '01 Sep 2026', status: 'Active' },
  { name: 'Mohit Gupta', email: 'mohit@example.com', role: 'user', verified: false, joined: '20 Aug 2026', status: 'Unverified' },
  { name: 'Sunita Patel', email: 'sunita@example.com', role: 'user', verified: true, joined: '18 Aug 2026', status: 'Suspended' },
  { name: 'Vikram Singh', email: 'vikram@example.com', role: 'lmo', verified: true, joined: '10 Aug 2026', status: 'Active' },
  { name: 'Neha Joshi', email: 'neha@example.com', role: 'field_officer', verified: true, joined: '01 Aug 2026', status: 'Active' },
];

const roleColor = {
  user: { color: '#E65100', bg: '#FFF3E0' },
  lmo: { color: '#2E7D32', bg: '#E8F5E9' },
  field_officer: { color: '#4A148C', bg: '#F3E5F5' },
  admin: { color: '#B71C1C', bg: '#FFEBEE' },
};
const roleLabel = { user: 'Public User', lmo: 'LMO Officer', field_officer: 'Field Officer', admin: 'Admin' };

export default function AdminUsers() {
  const [users, setUsers] = useState(ALL_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const filtered = users.filter(u =>
    (roleFilter === 'All' || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRoleChange = () => {
    setUsers(prev => prev.map(u => u.email === editUser.email ? { ...u, role: newRole } : u));
    setEditUser(null);
  };

  const toggleSuspend = (email) => {
    setUsers(prev => prev.map(u => u.email === email ? { ...u, status: u.status === 'Suspended' ? 'Active' : 'Suspended' } : u));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>ADMIN PORTAL</Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>User Management</Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>{users.length} total users</Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAddIcon />}
          sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700, px: 3 }}>
          Add User
        </Button>
      </Box>

      {/* Summary Chips */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        {Object.entries(roleLabel).map(([role, label]) => (
          <Chip key={role} label={`${label}: ${users.filter(u => u.role === role).length}`}
            sx={{ bgcolor: roleColor[role].bg, color: roleColor[role].color, fontWeight: 700 }} />
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField placeholder="Search by name or email..." size="small" value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
          sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Role</InputLabel>
          <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)} sx={{ borderRadius: 2 }}>
            <MenuItem value="All">All Roles</MenuItem>
            {Object.entries(roleLabel).map(([r, l]) => <MenuItem key={r} value={r}>{l}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                {['User', 'Email', 'Role', 'Verified', 'Joined', 'Status', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#424242', fontSize: '0.8rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.email} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, background: roleColor[u.role]?.bg, color: roleColor[u.role]?.color, fontSize: '0.75rem', fontWeight: 700 }}>
                        {u.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.83rem' }}>{u.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#616161' }}>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={roleLabel[u.role]} size="small" sx={{ bgcolor: roleColor[u.role]?.bg, color: roleColor[u.role]?.color, fontWeight: 700, fontSize: '0.68rem' }} />
                  </TableCell>
                  <TableCell>
                    {u.verified ? <CheckCircleIcon sx={{ color: '#2E7D32', fontSize: 18 }} /> : <BlockIcon sx={{ color: '#BDBDBD', fontSize: 18 }} />}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#757575' }}>{u.joined}</TableCell>
                  <TableCell>
                    <Chip label={u.status} size="small"
                      sx={{ bgcolor: u.status === 'Active' ? '#E8F5E9' : u.status === 'Suspended' ? '#FFEBEE' : '#FFF8E1', color: u.status === 'Active' ? '#2E7D32' : u.status === 'Suspended' ? '#B71C1C' : '#F57F17', fontWeight: 700, fontSize: '0.68rem' }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Change Role">
                        <IconButton size="small" onClick={() => { setEditUser(u); setNewRole(u.role); }} sx={{ color: '#1565C0', '&:hover': { bgcolor: '#E3F2FD' } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={u.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}>
                        <IconButton size="small" onClick={() => toggleSuspend(u.email)} sx={{ color: u.status === 'Suspended' ? '#2E7D32' : '#B71C1C', '&:hover': { bgcolor: u.status === 'Suspended' ? '#E8F5E9' : '#FFEBEE' } }}>
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

      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Change Role — {editUser?.name}</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>New Role</InputLabel>
            <Select value={newRole} label="New Role" onChange={(e) => setNewRole(e.target.value)} sx={{ borderRadius: 2 }}>
              {Object.entries(roleLabel).map(([r, l]) => <MenuItem key={r} value={r}>{l}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setEditUser(null)} sx={{ color: '#757575' }}>Cancel</Button>
          <Button variant="contained" sx={{ background: GRADIENT, fontWeight: 700 }} onClick={handleRoleChange}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
