import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Button, TextField, InputAdornment, Select, FormControl, InputLabel,
  MenuItem, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Divider, Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';

const COLOR = '#15803D';

const priorityColor = {
  High: { color: '#B91C1C', bg: '#FEF2F2' },
  Normal: { color: '#0284C7', bg: '#EFF6FF' },
  Low: { color: '#16A34A', bg: '#F0FDF4' },
};

const statusColor = {
  Pending: { color: '#B45309', bg: '#FFFBEB' },
  'Under Inspection': { color: '#0284C7', bg: '#EFF6FF' },
  Approved: { color: '#15803D', bg: '#F0FDF4' },
  Rejected: { color: '#B91C1C', bg: '#FEF2F2' },
};

export default function LMOPending() {
  const [apps, setApps] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected application for viewing details
  const [selectedApp, setSelectedApp] = useState(null);

  // Selected application for assigning a Field Officer
  const [assignModal, setAssignModal] = useState({
    open: false,
    app: null,
    foUserId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '11:00 AM',
    priority: 'Normal',
    notes: '',
    submitting: false,
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [appsRes, officersRes] = await Promise.all([
        fetch('http://localhost:5000/api/lmo/applications', { credentials: 'include' }),
        fetch('http://localhost:5000/api/lmo/officers', { credentials: 'include' }),
      ]);

      const appsData = await appsRes.json();
      const officersData = await officersRes.json();

      if (appsData.applications) {
        setApps(appsData.applications);
      }
      if (officersData.officers) {
        setOfficers(officersData.officers);
      }
    } catch (err) {
      setError('Failed to connect to Legal Metrology officer services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAssign = (app) => {
    // Pick first active officer if available
    const defaultFo = officers.find((o) => o.status === 'Active')?.dbId || '';
    setAssignModal({
      open: true,
      app,
      foUserId: defaultFo,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '11:30 AM',
      priority: app.priority || 'Normal',
      notes: `Territorial verification of ${app.instrument} at ${app.applicant}. Verify working standards tolerance under Rule 11.`,
      submitting: false,
    });
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!assignModal.foUserId) {
      setError('Please select an active Field Officer to assign.');
      return;
    }

    setAssignModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/lmo/applications/${assignModal.app.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          foUserId: assignModal.foUserId,
          scheduledDate: assignModal.scheduledDate,
          scheduledTime: assignModal.scheduledTime,
          priority: assignModal.priority,
          notes: assignModal.notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Application ${assignModal.app.appNumber} successfully assigned to Field Inspector!`);
        setAssignModal({ open: false, app: null, foUserId: '', scheduledDate: '', scheduledTime: '', priority: 'Normal', notes: '', submitting: false });
        fetchData();
      } else {
        setError(data.error || 'Failed to assign field officer.');
      }
    } catch (err) {
      setError('Could not connect to server to assign officer.');
    } finally {
      setAssignModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleDirectAction = async (appId, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/lmo/applications/${appId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action,
          notes: action === 'approve' ? 'Direct LMO Stamping Approval' : 'Rejected after territorial review.',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Application marked as ${action === 'approve' ? 'Approved & Stamped' : 'Rejected'}.`);
        setSelectedApp(null);
        fetchData();
      } else {
        setError(data.error || 'Action failed.');
      }
    } catch (err) {
      setError('Server communication failed.');
    }
  };

  const filtered = apps.filter((a) => {
    const matchesPriority = priorityFilter === 'All' || a.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      a.applicant?.toLowerCase().includes(q) ||
      a.appNumber?.toLowerCase().includes(q) ||
      a.instrument?.toLowerCase().includes(q) ||
      a.serial?.toLowerCase().includes(q);
    return matchesPriority && matchesStatus && matchesSearch;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
            <Chip
              label="JURISDICTION: NORTH DELHI DIVISION"
              size="small"
              sx={{ bgcolor: '#F0FDF4', color: COLOR, fontWeight: 800, fontSize: '0.7rem' }}
            />
            <Chip
              label="DSC: DSC-DL-2026-SHA256 [CLASS-3 DSC ACTIVE]"
              size="small"
              sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: '0.7rem' }}
            />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>
            Statutory Verification Queue
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>
            Scrutinize public applications, allocate geofenced Field Inspectors, and issue legal metrology stamping orders.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          sx={{ borderColor: '#CBD5E1', color: '#475569', fontWeight: 700 }}
        >
          Refresh Queue
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by App ID, business, or serial..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
          sx={{ minWidth: 300, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)} sx={{ borderRadius: 2 }}>
            {['All', 'Pending', 'Under Inspection', 'Approved', 'Rejected'].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={priorityFilter} label="Priority" onChange={(e) => setPriorityFilter(e.target.value)} sx={{ borderRadius: 2 }}>
            {['All', 'High', 'Normal', 'Low'].map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {!loading && (
          <Chip
            label={`${filtered.length} application${filtered.length !== 1 ? 's' : ''}`}
            sx={{ bgcolor: '#F5F5F5', fontWeight: 700, alignSelf: 'center' }}
          />
        )}
      </Box>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: COLOR }} />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                  {['App ID', 'Applicant & Premises', 'Instrument Specification', 'Submitted', 'Priority', 'Status', 'Allocated Officer', 'Actions'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: '#424242', fontSize: '0.8rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell sx={{ fontWeight: 800, color: COLOR, fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      {app.appNumber}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {app.applicant}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {app.address} · 📞 {app.contact}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{app.instrument}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        S/N: {app.serial} ({app.make})
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#64748B' }}>{app.submitted}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.priority}
                        size="small"
                        sx={{
                          bgcolor: priorityColor[app.priority]?.bg,
                          color: priorityColor[app.priority]?.color,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={app.status}
                        size="small"
                        sx={{
                          bgcolor: statusColor[app.status]?.bg,
                          color: statusColor[app.status]?.color,
                          fontWeight: 700,
                          fontSize: '0.72rem',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {app.assignedFoName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon sx={{ fontSize: 16, color: '#7E22CE' }} />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#6B21A8' }}>
                            {app.assignedFoName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontStyle: 'italic' }}>
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Full Dossier">
                          <IconButton size="small" onClick={() => setSelectedApp(app)} sx={{ color: '#1565C0' }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {app.status === 'Pending' && (
                          <Tooltip title="Assign Field Inspector">
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<AssignmentIndIcon />}
                              onClick={() => handleOpenAssign(app)}
                              sx={{
                                background: 'linear-gradient(135deg, #7E22CE 0%, #581C87 100%)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                py: 0.4,
                                px: 1.2,
                                textTransform: 'none',
                              }}
                            >
                              Assign FO
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: '#9E9E9E' }}>
                      No applications found matching the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      {/* ── ASSIGN FIELD OFFICER MODAL ── */}
      <Dialog
        open={assignModal.open}
        onClose={() => !assignModal.submitting && setAssignModal({ ...assignModal, open: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <Box component="form" onSubmit={handleConfirmAssign}>
          <DialogTitle sx={{ fontWeight: 800, color: '#6B21A8', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIndIcon />
            Dispatch Field Inspector — {assignModal.app?.appNumber}
          </DialogTitle>
          <Divider />

          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#FAF5FF', borderColor: '#E9D5FF', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#6B21A8', fontWeight: 800, display: 'block' }}>
                APPLICATION SUMMARY
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, color: '#1E293B' }}>
                {assignModal.app?.applicant}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569' }}>
                {assignModal.app?.instrument} (S/N: {assignModal.app?.serial})
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                📍 {assignModal.app?.address}
              </Typography>
            </Paper>

            <FormControl fullWidth required size="small">
              <InputLabel>Select Authorized Field Inspector *</InputLabel>
              <Select
                value={assignModal.foUserId}
                label="Select Authorized Field Inspector *"
                onChange={(e) => setAssignModal({ ...assignModal, foUserId: e.target.value })}
              >
                {officers.length === 0 ? (
                  <MenuItem value="" disabled>
                    No Field Officers available — Nominate one first
                  </MenuItem>
                ) : (
                  officers.map((fo) => (
                    <MenuItem key={fo.dbId} value={fo.dbId}>
                      {fo.name} ({fo.id}) — {fo.zone} [{fo.status}]
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Inspection Date *"
                  type="date"
                  value={assignModal.scheduledDate}
                  onChange={(e) => setAssignModal({ ...assignModal, scheduledDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Inspection Time *"
                  value={assignModal.scheduledTime}
                  onChange={(e) => setAssignModal({ ...assignModal, scheduledTime: e.target.value })}
                  placeholder="e.g. 11:30 AM"
                />
              </Grid>
            </Grid>

            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={assignModal.priority}
                label="Priority"
                onChange={(e) => setAssignModal({ ...assignModal, priority: e.target.value })}
              >
                <MenuItem value="High">🔴 High Priority</MenuItem>
                <MenuItem value="Normal">🔵 Normal Priority</MenuItem>
                <MenuItem value="Low">🟢 Low Priority</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Stamping Instructions for Inspector"
              value={assignModal.notes}
              onChange={(e) => setAssignModal({ ...assignModal, notes: e.target.value })}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button
              onClick={() => setAssignModal({ ...assignModal, open: false })}
              disabled={assignModal.submitting}
              sx={{ color: '#64748B' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={assignModal.submitting}
              sx={{
                background: 'linear-gradient(135deg, #7E22CE 0%, #581C87 100%)',
                fontWeight: 700,
                px: 3,
              }}
            >
              {assignModal.submitting ? 'Dispatching...' : 'Assign & Dispatch FO'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ── DETAIL MODAL ── */}
      <Dialog open={!!selectedApp} onClose={() => setSelectedApp(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1A1A2E' }}>
          Dossier Details — {selectedApp?.appNumber}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {selectedApp && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                ['Applicant Name', selectedApp.applicant],
                ['Premises Address', selectedApp.address],
                ['Contact Phone', selectedApp.contact],
                ['Instrument Type', selectedApp.instrument],
                ['Make & Serial No', `${selectedApp.make} · S/N: ${selectedApp.serial}`],
                ['Submitted Date', selectedApp.submitted],
                ['Priority', selectedApp.priority],
                ['Status', selectedApp.status],
                ['Assigned Inspector', selectedApp.assignedFoName || 'None assigned yet'],
                ['Scheduled Visit', selectedApp.scheduledDate ? `${selectedApp.scheduledDate} at ${selectedApp.scheduledTime}` : 'Not scheduled'],
                ['Certificate No', selectedApp.certificateNo || 'Pending on-site stamping'],
              ].map(([k, v]) => (
                <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', pb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>{k}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>{v}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setSelectedApp(null)} sx={{ color: '#64748B' }}>Close</Button>
          {selectedApp?.status === 'Pending' && (
            <>
              <Button onClick={() => handleDirectAction(selectedApp?.id, 'reject')} variant="outlined" color="error" sx={{ fontWeight: 700 }}>
                Reject
              </Button>
              <Button onClick={() => handleOpenAssign(selectedApp)} variant="contained" sx={{ background: 'linear-gradient(135deg, #7E22CE 0%, #581C87 100%)', fontWeight: 700 }}>
                Assign Inspector
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
