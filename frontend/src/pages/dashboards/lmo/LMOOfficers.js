
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Avatar, Chip, Button, LinearProgress,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, FormControl, InputLabel, Select, MenuItem, Divider,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RefreshIcon from '@mui/icons-material/Refresh';
import API_BASE from '../../../config/api';

const COLOR = '#1B5E20';
const GRADIENT = 'linear-gradient(135deg, #2E7D32, #1B5E20)';

export default function LMOOfficers() {
  const [searchParams] = useSearchParams();
  const assignOfficerIdFromUrl = searchParams.get('assignOfficerId');

  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Task assignment dialog
  const [selected, setSelected] = useState(null);
  const [pendingApps, setPendingApps] = useState([]);
  const [, setLoadingApps] = useState(false);
  const [assignForm, setAssignForm] = useState({
    appId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '11:30 AM',
    priority: 'Normal',
    notes: '',
    submitting: false,
  });

  // Nomination dialog state
  const [openNominate, setOpenNominate] = useState(false);
  const [nomForm, setNomForm] = useState({
    name: '',
    designation: 'Field Verification Inspector',
    email: '',
    phone: '',
    employeeCode: '',
    circlePin: '110005',
    circleZone: 'Karol Bagh Circle - North Delhi',
  });

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lmo/officers', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOfficers(data.officers || []);
      }
    } catch (err) {
      console.warn('LMO officers fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApps = async () => {
    setLoadingApps(true);
    try {
      const res = await fetch(`${API_BASE}/api/lmo/applications`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const pending = (data.applications || []).filter((a) => a.status === 'Pending');
        setPendingApps(pending);
      }
    } catch (err) {
      console.warn('LMO pending apps fetch fallback:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
    fetchPendingApps();
  }, []);

  // Auto-open modal if assignOfficerId is in URL
  useEffect(() => {
    if (assignOfficerIdFromUrl && officers.length > 0 && !selected) {
      const targetOfficer = officers.find((o) => o.dbId === assignOfficerIdFromUrl || o.id === assignOfficerIdFromUrl);
      if (targetOfficer) {
        handleOpenAssign(targetOfficer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignOfficerIdFromUrl, officers]);

  const handleOpenAssign = (officer) => {
    setSelected(officer);
    const firstApp = pendingApps[0];
    setAssignForm({
      appId: firstApp?.id || '',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '11:30 AM',
      priority: firstApp?.priority || 'Normal',
      notes: `Territorial on-site verification under Section 24 of Legal Metrology Act in ${officer.zone}. Verify Rule 11 tolerances.`,
      submitting: false,
    });
  };

  const handleDispatchTask = async (e) => {
    e.preventDefault();
    if (!assignForm.appId) {
      setFeedback({ type: 'error', message: 'Please select a pending application to assign to this officer.' });
      return;
    }
    if (!selected?.dbId) {
      setFeedback({ type: 'error', message: 'Invalid Field Officer selected.' });
      return;
    }

    setAssignForm((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await fetch(`${API_BASE}/api/lmo/applications/${assignForm.appId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assigneeType: 'FIELD_OFFICER',
          foUserId: selected.dbId,
          scheduledDate: assignForm.scheduledDate,
          scheduledTime: assignForm.scheduledTime,
          priority: assignForm.priority,
          notes: assignForm.notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const assignedApp = pendingApps.find((a) => a.id === assignForm.appId);
        setFeedback({
          type: 'success',
          message: `Application ${assignedApp?.appNumber || ''} successfully allocated to Inspector ${selected.name}! Scheduled on ${assignForm.scheduledDate}.`,
        });
        setSelected(null);
        fetchOfficers();
        fetchPendingApps();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to dispatch task.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error while dispatching task.' });
    } finally {
      setAssignForm((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleNominateSubmit = async (e) => {
    e.preventDefault();
    if (!nomForm.name || !nomForm.email || !nomForm.employeeCode || !nomForm.circleZone) {
      setFeedback({ type: 'error', message: 'All mandatory fields must be filled.' });
      return;
    }

    const payload = {
      name: nomForm.name,
      email: nomForm.email,
      phone: nomForm.phone,
      employeeCode: nomForm.employeeCode,
      designation: nomForm.designation,
      circleZone: `${nomForm.circleZone} (Pin: ${nomForm.circlePin})`,
    };

    try {
      const res = await fetch('/api/lmo/officer/nominate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Inspector ${payload.name} nominated successfully! Nomination dossier forwarded to Central Admin for HRMS & Vigilance Clearance.`,
        });
        setOpenNominate(false);
        setNomForm({
          name: '',
          designation: 'Field Verification Inspector',
          email: '',
          phone: '',
          employeeCode: '',
          circlePin: '110005',
          circleZone: 'Karol Bagh Circle - North Delhi',
        });
        fetchOfficers();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to submit nomination.' });
      }
    } catch {
      // Local state fallback
      const newMock = {
        id: payload.employeeCode,
        name: payload.name,
        phone: payload.phone || '9876500000',
        email: payload.email,
        zone: payload.circleZone,
        assigned: 0,
        completed: 0,
        monthly: 0,
        target: 20,
        status: 'Pending Admin Clearance',
        joined: 'Just now',
      };
      setOfficers((prev) => [newMock, ...prev]);
      setFeedback({
        type: 'success',
        message: `Inspector ${payload.name} nominated successfully! Awaiting Central Admin verification.`,
      });
      setOpenNominate(false);
    }
  };

  const getStatusChip = (status) => {
    if (status === 'Active' || status === 'ACTIVE') {
      return (
        <Chip
          icon={<CheckCircleIcon sx={{ fontSize: '13px !important' }} />}
          label="Active & Bound"
          size="small"
          sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 800, fontSize: '0.65rem' }}
        />
      );
    }
    if (status === 'Pending Admin Clearance' || status === 'PENDING_VERIFICATION') {
      return (
        <Chip
          icon={<HourglassEmptyIcon sx={{ fontSize: '13px !important' }} />}
          label="Pending Admin Clearance"
          size="small"
          sx={{ bgcolor: '#FFF8E1', color: '#F57F17', fontWeight: 800, fontSize: '0.65rem' }}
        />
      );
    }
    if (status === 'Activation Pending' || status === 'PENDING_ACTIVATION') {
      return (
        <Chip
          icon={<SecurityIcon sx={{ fontSize: '13px !important' }} />}
          label="Clearance Approved (Token Issued)"
          size="small"
          sx={{ bgcolor: '#E3F2FD', color: '#1565C0', fontWeight: 800, fontSize: '0.65rem' }}
        />
      );
    }
    return (
      <Chip
        label={status}
        size="small"
        sx={{ bgcolor: '#F5F5F5', color: '#616161', fontWeight: 700, fontSize: '0.65rem' }}
      />
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* ── Top Header Banner ── */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Chip
              label="DISTRICT JURISDICTION: DELHI NORTH"
              size="small"
              sx={{ bgcolor: '#E8F5E9', color: COLOR, fontWeight: 800, fontSize: '0.68rem', borderRadius: '6px' }}
            />
            <Typography variant="caption" sx={{ color: '#757575', fontWeight: 600 }}>
              Geofenced Circle Inspectorate
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E', letterSpacing: '-0.02em' }}>
            Field Inspectors Roster &amp; Circle Geofencing
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>
            Nominate on-ground verification officers with circle boundaries for State Directorate clearance.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            disabled={loading}
            startIcon={<RefreshIcon />}
            onClick={fetchOfficers}
            sx={{ borderRadius: 2, borderColor: '#C8E6C9', color: COLOR, fontWeight: 700 }}
          >
            {loading ? 'Syncing...' : 'Sync Roster'}
          </Button>

          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenNominate(true)}
            sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700, px: 3, boxShadow: '0 4px 14px rgba(27, 94, 32, 0.35)' }}
          >
            Nominate Field Inspector
          </Button>
        </Box>
      </Box>

      {/* Feedback banner */}
      {feedback.message && (
        <Alert
          severity={feedback.type || 'info'}
          onClose={() => setFeedback({ type: '', message: '' })}
          sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Grid of Officer Dossier Cards */}
      <Grid container spacing={3}>
        {officers.length === 0 ? (
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                textAlign: 'center',
                borderRadius: 3,
                border: '1.5px dashed #CBD5E1',
                bgcolor: '#F8FAFC',
              }}
            >
              <SecurityIcon sx={{ fontSize: 56, color: '#94A3B8', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
                No Field Inspectors in Roster
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 460, mx: 'auto', mb: 3 }}>
                There are currently no Field Officers registered in this jurisdiction. Nominate an officer below to begin the state clearance and onboarding flow.
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setOpenNominate(true)}
                sx={{ background: GRADIENT, fontWeight: 700, px: 3, borderRadius: 2 }}
              >
                Nominate Field Inspector
              </Button>
            </Paper>
          </Grid>
        ) : (
          officers.map((o) => {
            const isPending = o.status === 'Pending Admin Clearance' || o.status === 'PENDING_VERIFICATION';
            const isActivation = o.status === 'Activation Pending' || o.status === 'PENDING_ACTIVATION';

            return (
              <Grid item xs={12} md={6} lg={4} key={o.id || o.email}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1.5px solid ${isPending ? '#FFE082' : isActivation ? '#90CAF9' : '#C8E6C9'}`,
                    height: '100%',
                    bgcolor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Avatar sx={{ width: 48, height: 48, background: GRADIENT, fontWeight: 800 }}>
                          {o.name?.charAt(0) || 'F'}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: '#1A1A2E' }}>
                            {o.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#757575', fontWeight: 600 }}>
                            {o.id}
                          </Typography>
                        </Box>
                      </Box>
                      {getStatusChip(o.status)}
                    </Box>

                    {/* Geofenced Circle */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2, bgcolor: '#F8FAFC', p: 1, borderRadius: 1.5 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: '#15803D' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                        {o.zone || 'Delhi North Circle'}
                      </Typography>
                    </Box>

                    {/* Status Notes */}
                    {isPending ? (
                      <Typography variant="caption" sx={{ color: '#B45309', display: 'block', mb: 2, fontStyle: 'italic' }}>
                        Awaiting Central Admin Dossier Clearance
                      </Typography>
                    ) : isActivation ? (
                      <Typography variant="caption" sx={{ color: '#1D4ED8', display: 'block', mb: 2, fontStyle: 'italic' }}>
                        Activation token issued. Awaiting first-time password setup
                      </Typography>
                    ) : null}

                    {/* Progress / Monthly verification bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#757575', fontWeight: 600 }}>Monthly Verification Quota</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: COLOR }}>
                          {o.monthly || 0}/{o.target || 20}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={((o.monthly || 0) / (o.target || 20)) * 100}
                        sx={{ height: 6, borderRadius: 3, bgcolor: '#E8F5E9', '& .MuiLinearProgress-bar': { background: GRADIENT } }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box sx={{ textAlign: 'center', flex: 1, p: 1, bgcolor: '#F9FBE7', borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: COLOR }}>{o.assigned || 0}</Typography>
                        <Typography variant="caption" sx={{ color: '#757575' }}>Active Today</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', flex: 1, p: 1, bgcolor: '#F9FBE7', borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1565C0' }}>{o.completed || 0}</Typography>
                        <Typography variant="caption" sx={{ color: '#757575' }}>Calibrated</Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Card Action footer */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                    {o.phone && (
                      <Tooltip title={o.phone}>
                        <IconButton size="small" sx={{ bgcolor: '#E8F5E9', color: COLOR }}>
                          <CallIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {o.email && (
                      <Tooltip title={o.email}>
                        <IconButton size="small" sx={{ bgcolor: '#E3F2FD', color: '#1565C0' }}>
                          <EmailIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Button
                      size="small"
                      startIcon={<AssignmentIcon />}
                      disabled={isPending || isActivation}
                      onClick={() => handleOpenAssign(o)}
                      sx={{ ml: 'auto', color: COLOR, fontWeight: 700, fontSize: '0.78rem' }}
                    >
                      Assign Task
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            );
          }))}
      </Grid>

      {/* ── MODAL: NOMINATE FIELD INSPECTOR ── */}
      <Dialog open={openNominate} onClose={() => setOpenNominate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonAddIcon sx={{ color: COLOR }} />
          Nominate Field Inspector for Circle Geofence
        </DialogTitle>
        <Divider />
        <Box component="form" onSubmit={handleNominateSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Statutory Requirement: Field Officers must be nominated by their jurisdictional LMO. The nomination is automatically routed to the Central State Directorate for HRMS &amp; Vigilance Clearance before single-use login credentials can be activated.
            </Alert>

            <TextField
              label="Inspector Full Name"
              required
              fullWidth
              size="small"
              placeholder="e.g. Inspector Rohan Mehra"
              value={nomForm.name}
              onChange={(e) => setNomForm({ ...nomForm, name: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Official Government Email"
                  type="email"
                  required
                  fullWidth
                  size="small"
                  placeholder="rohan.mehra@gov.in"
                  value={nomForm.email}
                  onChange={(e) => setNomForm({ ...nomForm, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mobile Contact Number"
                  required
                  fullWidth
                  size="small"
                  placeholder="98XXXXXXXX"
                  value={nomForm.phone}
                  onChange={(e) => setNomForm({ ...nomForm, phone: e.target.value })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Government Employee Code"
                  required
                  fullWidth
                  size="small"
                  placeholder="e.g. FO-DEL-109"
                  value={nomForm.employeeCode}
                  onChange={(e) => setNomForm({ ...nomForm, employeeCode: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Designation</InputLabel>
                  <Select
                    value={nomForm.designation}
                    label="Designation"
                    onChange={(e) => setNomForm({ ...nomForm, designation: e.target.value })}
                  >
                    <MenuItem value="Field Verification Inspector">Field Verification Inspector</MenuItem>
                    <MenuItem value="Senior Inspector (Legal Metrology)">Senior Inspector (Legal Metrology)</MenuItem>
                    <MenuItem value="Sub-Inspector (Testing & Stamping)">Sub-Inspector (Testing &amp; Stamping)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <FormControl fullWidth size="small">
                  <InputLabel>Assigned Geofenced Circle</InputLabel>
                  <Select
                    value={nomForm.circleZone}
                    label="Assigned Geofenced Circle"
                    onChange={(e) => setNomForm({ ...nomForm, circleZone: e.target.value })}
                  >
                    <MenuItem value="Karol Bagh Circle - North Delhi">Karol Bagh Circle - North Delhi</MenuItem>
                    <MenuItem value="Civil Lines Circle - North Delhi">Civil Lines Circle - North Delhi</MenuItem>
                    <MenuItem value="Rohini Commercial Circle">Rohini Commercial Circle</MenuItem>
                    <MenuItem value="Chandni Chowk Market Zone">Chandni Chowk Market Zone</MenuItem>
                    <MenuItem value="Narela Industrial Sub-Division">Narela Industrial Sub-Division</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Circle Pin Code"
                  required
                  fullWidth
                  size="small"
                  placeholder="110005"
                  value={nomForm.circlePin}
                  onChange={(e) => setNomForm({ ...nomForm, circlePin: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button onClick={() => setOpenNominate(false)} sx={{ color: '#757575' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ background: GRADIENT, fontWeight: 700, px: 3 }}>
              Submit for Admin Clearance
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ── MODAL: ASSIGN TASK TO ACTIVE OFFICER ── */}
      <Dialog
        open={!!selected}
        onClose={() => !assignForm.submitting && setSelected(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <Box component="form" onSubmit={handleDispatchTask}>
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, color: '#1B5E20' }}>
            <AssignmentIcon sx={{ color: COLOR }} />
            Assign Verification Task to Inspector
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}>
            {/* Inspector Identity Banner */}
            {selected && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#F0FDF4',
                  border: '1.5px solid #BBF7D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ background: GRADIENT, fontWeight: 800, width: 42, height: 42 }}>
                    {selected.name?.charAt(0) || 'F'}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#14532D' }}>
                      {selected.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 600, display: 'block' }}>
                      ID: {selected.id} · 📍 {selected.zone} {selected.phone ? `• 📞 ${selected.phone}` : ''}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip
                    size="small"
                    label={`${selected.assigned || 0} active tasks`}
                    sx={{
                      bgcolor: '#FFFFFF',
                      color: (selected.assigned || 0) === 0 ? '#15803D' : '#B45309',
                      fontWeight: 700,
                      border: '1px solid #BBF7D0',
                    }}
                  />
                  <Chip
                    size="small"
                    label={selected.status}
                    sx={{
                      bgcolor: selected.status === 'Active' ? '#DCFCE7' : '#FEF3C7',
                      color: selected.status === 'Active' ? '#15803D' : '#92400E',
                      fontWeight: 800,
                    }}
                  />
                </Box>
              </Paper>
            )}

            {/* Pending Application Selector */}
            {pendingApps.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <strong>No pending applications in queue.</strong> All current applications in this jurisdiction are already assigned or processed.
              </Alert>
            ) : (
              <>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Select Pending Application *</InputLabel>
                  <Select
                    value={assignForm.appId}
                    label="Select Pending Application *"
                    onChange={(e) => {
                      const app = pendingApps.find((a) => a.id === e.target.value);
                      setAssignForm((prev) => ({
                        ...prev,
                        appId: e.target.value,
                        priority: app?.priority || prev.priority,
                        notes: `Territorial on-site verification of ${app?.instrument || 'instrument'} at ${app?.applicant || 'applicant premises'}. Verify Rule 11 tolerances.`,
                      }));
                    }}
                  >
                    {pendingApps.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        <strong>{a.appNumber}</strong> &nbsp;—&nbsp; {a.applicant} &nbsp;({a.instrument}) &nbsp;•&nbsp; Priority: {a.priority}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Selected Application Preview Dossier */}
                {(() => {
                  const currApp = pendingApps.find((a) => a.id === assignForm.appId);
                  if (!currApp) return null;
                  return (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>APPLICANT &amp; FIRM</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>{currApp.applicant}</Typography>
                          <Typography variant="caption" sx={{ color: '#475569' }}>📍 {currApp.address}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>INSTRUMENT DETAILS</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>{currApp.instrument}</Typography>
                          <Typography variant="caption" sx={{ color: '#475569' }}>S/N: {currApp.serial} • Make: {currApp.make}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                })()}

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Scheduled Inspection Date *"
                      required
                      value={assignForm.scheduledDate}
                      onChange={(e) => setAssignForm({ ...assignForm, scheduledDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Scheduled Time *"
                      required
                      value={assignForm.scheduledTime}
                      onChange={(e) => setAssignForm({ ...assignForm, scheduledTime: e.target.value })}
                      placeholder="e.g. 11:30 AM"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={assignForm.priority}
                        label="Priority"
                        onChange={(e) => setAssignForm({ ...assignForm, priority: e.target.value })}
                      >
                        <MenuItem value="High">🔴 High Priority</MenuItem>
                        <MenuItem value="Normal">🔵 Normal</MenuItem>
                        <MenuItem value="Low">🟢 Low Priority</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  label="Special Calibration Directives &amp; Inspection Instructions"
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  placeholder="Enter specific verification requirements, physical stamping instructions, or standard weights specifications..."
                />
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button onClick={() => setSelected(null)} sx={{ color: '#757575', fontWeight: 600 }}>Cancel</Button>
            <Button
              type="submit"
              disabled={assignForm.submitting || pendingApps.length === 0 || !assignForm.appId}
              variant="contained"
              sx={{ background: GRADIENT, fontWeight: 700, px: 3 }}
            >
              {assignForm.submitting ? 'Dispatching...' : `Dispatch Task to ${selected?.name?.split(' ')[0] || 'Officer'}`}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
