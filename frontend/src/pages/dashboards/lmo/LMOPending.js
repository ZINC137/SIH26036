import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Button, TextField, InputAdornment, Select, FormControl, InputLabel,
  MenuItem, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Divider, Grid, Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import GavelIcon from '@mui/icons-material/Gavel';
import VerifiedIcon from '@mui/icons-material/Verified';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import API_BASE, { authFetch } from '../../../config/api';

const COLOR = '#15803D';

const priorityColor = {
  High: { color: '#B91C1C', bg: '#FEF2F2' },
  Normal: { color: '#0284C7', bg: '#EFF6FF' },
  Low: { color: '#16A34A', bg: '#F0FDF4' },
};

const statusColor = {
  Pending: { color: '#B45309', bg: '#FFFBEB' },
  'Under Inspection': { color: '#0284C7', bg: '#EFF6FF' },
  'Inspection Reported': { color: '#7E22CE', bg: '#FAF5FF' }, // FO submitted — awaiting LMO sign
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
  // Selected document for full-screen preview lightbox
  const [previewDoc, setPreviewDoc] = useState(null);

  const [gatcCentres, setGatcCentres] = useState([]);
  const [appEligibility, setAppEligibility] = useState(null);

  // Selected application for assigning a Field Officer or GATC
  const [assignModal, setAssignModal] = useState({
    open: false,
    app: null,
    assigneeType: 'FIELD_OFFICER', // 'FIELD_OFFICER' | 'GATC'
    foUserId: '',
    gatcUserId: '',
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
      const [appsRes, officersRes, gatcRes] = await Promise.all([
        authFetch('/api/lmo/applications'),
        authFetch('/api/lmo/officers'),
        authFetch('/api/lmo/gatc-centres'),
      ]);

      const appsData = await appsRes.json();
      const officersData = await officersRes.json();
      const gatcData = await gatcRes.json();

      if (appsData.applications) {
        setApps(appsData.applications);
      }
      if (officersData.officers) {
        setOfficers(officersData.officers);
      }
      if (gatcData.centres) {
        setGatcCentres(gatcData.centres);
      }
    } catch (err) {
      setError('Failed to connect to Legal Metrology officer services.');
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assignAppIdFromUrl = searchParams.get('assignAppId');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (assignAppIdFromUrl && apps.length > 0 && !assignModal.open) {
      const targetApp = apps.find((a) => a.id === assignAppIdFromUrl);
      if (targetApp && targetApp.status === 'Pending') {
        handleOpenAssign(targetApp);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps, assignAppIdFromUrl]);

  const handleOpenAssign = async (app) => {
    // Smart load balancing: Pick active officer with lowest active workload
    const activeOfficers = officers.filter((o) => o.status === 'Active');
    const sorted = [...activeOfficers].sort((a, b) => (a.assigned || 0) - (b.assigned || 0));
    const defaultFo = sorted[0]?.dbId || activeOfficers[0]?.dbId || officers[0]?.dbId || '';
    setAppEligibility(null);

    setAssignModal({
      open: true,
      app,
      assigneeType: 'FIELD_OFFICER', // NEVER auto-assign GATC (Rule 4)
      foUserId: defaultFo,
      gatcUserId: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '11:30 AM',
      priority: app.priority || 'Normal',
      notes: `Territorial verification of ${app.instrument} at ${app.applicant}. Verify working standards tolerance under Rule 11.`,
      submitting: false,
    });

    try {
      const catCode = app.raw?.selected_category_code || app.instrumentType;
      const state = app.raw?.state || 'Delhi';
      const district = app.raw?.city || 'North Delhi';
      const pref = app.raw?.preferred_verification_route || 'NO_PREFERENCE';
      const capacity = app.raw?.capacity || app.capacity || '';
      const unit = app.raw?.unit || app.unit || '';
      const res = await authFetch(`/api/rules/eligibility?categoryCode=${encodeURIComponent(catCode)}&state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&preferredRoute=${encodeURIComponent(pref)}&capacity=${encodeURIComponent(capacity)}&unit=${encodeURIComponent(unit)}`);
      const data = await res.json();
      const eligibility = data.eligibility || data;
      setAppEligibility(eligibility);
      if (eligibility.eligibleGATCs && eligibility.eligibleGATCs.length > 0) {
        setAssignModal((prev) => ({
          ...prev,
          gatcUserId: eligibility.eligibleGATCs[0].id || eligibility.eligibleGATCs[0].dbId,
        }));
      }
    } catch (e) {
      console.error('Error fetching authority eligibility for assignment modal:', e);
    }
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (assignModal.assigneeType === 'FIELD_OFFICER' && !assignModal.foUserId) {
      setError('Please select an active Field Officer to assign.');
      return;
    }
    if (assignModal.assigneeType === 'GATC' && !assignModal.gatcUserId) {
      setError('Please select an accredited Government Approved Test Centre.');
      return;
    }

    setAssignModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await authFetch(`/api/lmo/applications/${assignModal.app.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigneeType: assignModal.assigneeType,
          foUserId: assignModal.assigneeType === 'FIELD_OFFICER' ? assignModal.foUserId : null,
          gatcUserId: assignModal.assigneeType === 'GATC' ? assignModal.gatcUserId : null,
          scheduledDate: assignModal.scheduledDate,
          scheduledTime: assignModal.scheduledTime,
          priority: assignModal.priority,
          notes: assignModal.notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Application ${assignModal.app.appNumber} successfully allocated for verification!`);
        setAssignModal({ open: false, app: null, assigneeType: 'FIELD_OFFICER', foUserId: '', gatcUserId: '', scheduledDate: '', scheduledTime: '', priority: 'Normal', notes: '', submitting: false });
        fetchData();
      } else {
        setError(data.error || 'Failed to assign.');
      }
    } catch (err) {
      setError('Could not connect to server to allocate task.');
    } finally {
      setAssignModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleDirectAction = async (appId, action, notes) => {
    try {
      const res = await authFetch(`/api/lmo/applications/${appId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: notes || (action === 'approve'
            ? 'FO inspection report reviewed and verified by LMO. Certificate issued under Section 24 of Legal Metrology Act.'
            : action === 'correction'
            ? 'Rectification ordered: Instrument requires repair / calibration adjustment before retesting.'
            : 'Rejected after territorial review.'),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(action === 'approve'
          ? `Certificate issued! ${data.message}`
          : action === 'correction'
          ? `Notice of non-compliance issued. Correction / repair required.`
          : `Application rejected.`);
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
            {['All', 'Pending', 'Under Inspection', 'Inspection Reported', 'Approved', 'Rejected'].map((s) => (
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
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
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

                        {app.status === 'Inspection Reported' && (
                          <Tooltip title="Review FO Report & Issue Certificate (LMO Sign)">
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<GavelIcon />}
                              onClick={() => setSelectedApp(app)}
                              sx={{
                                background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                py: 0.4,
                                px: 1.2,
                                textTransform: 'none',
                              }}
                            >
                              Sign & Issue
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

            {/* Statutory Authority Routing Eligibility (Rule A-H) */}
            {appEligibility && (
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Statutory Authority Eligibility (First Schedule)
                  </Typography>
                  <Chip
                    size="small"
                    label={appEligibility.gatcEligible ? 'GATC & LMO Eligible' : 'LMO Field Stamping Only'}
                    sx={{
                      bgcolor: appEligibility.gatcEligible ? '#DCFCE7' : '#FEF3C7',
                      color: appEligibility.gatcEligible ? '#166534' : '#92400E',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#475569', mb: 1 }}>
                  {appEligibility.reason}
                </Typography>
                {appEligibility.preferredRoute && appEligibility.preferredRoute !== 'NO_PREFERENCE' && (
                  <Chip
                    size="small"
                    label={`Applicant Requested Preference: ${appEligibility.preferredRoute} (Preference only — Allocator assigns final authority)`}
                    sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600, fontSize: '0.72rem' }}
                  />
                )}
              </Box>
            )}

            {/* Assignee Authority Type Selection */}
            <FormControl fullWidth size="small">
              <InputLabel>Allocation Target *</InputLabel>
              <Select
                value={assignModal.assigneeType}
                label="Allocation Target *"
                onChange={(e) => {
                  const newType = e.target.value;
                  const availableGatc =
                    appEligibility?.eligibleGATCs?.[0]?.id ||
                    appEligibility?.eligibleGATCs?.[0]?.dbId ||
                    gatcCentres?.[0]?.dbId ||
                    gatcCentres?.[0]?.id ||
                    '';
                  setAssignModal((prev) => ({
                    ...prev,
                    assigneeType: newType,
                    gatcUserId: newType === 'GATC' && !prev.gatcUserId ? availableGatc : prev.gatcUserId,
                  }));
                }}
              >
                <MenuItem value="FIELD_OFFICER">👮 On-Ground Field Inspector (Circle / Field Stamping)</MenuItem>
                <MenuItem
                  value="GATC"
                  disabled={appEligibility && !appEligibility.gatcEligible}
                >
                  🔬 Government Approved Test Centre (GATC Lab) {appEligibility && !appEligibility.gatcEligible ? '— [Legally Ineligible]' : ''}
                </MenuItem>
              </Select>
            </FormControl>

            {assignModal.assigneeType === 'FIELD_OFFICER' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                {fo.name} ({fo.id})
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                                {fo.zone}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                              <Chip
                                size="small"
                                label={`${fo.assigned || 0} active`}
                                sx={{
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  bgcolor: (fo.assigned || 0) === 0 ? '#DCFCE7' : '#FEF3C7',
                                  color: (fo.assigned || 0) === 0 ? '#15803D' : '#B45309',
                                }}
                              />
                              <Chip
                                size="small"
                                label={fo.status}
                                sx={{
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  bgcolor: fo.status === 'Active' ? '#EFF6FF' : '#F1F5F9',
                                  color: fo.status === 'Active' ? '#1D4ED8' : '#64748B',
                                }}
                              />
                            </Box>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {/* Selected Officer Preview Card */}
                {(() => {
                  const sel = officers.find((o) => o.dbId === assignModal.foUserId);
                  if (!sel) return null;
                  return (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#FAF5FF',
                        border: '1.5px solid #E9D5FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar sx={{ bgcolor: '#7E22CE', color: '#fff', fontWeight: 800, width: 36, height: 36, fontSize: '0.85rem' }}>
                          {sel.name?.charAt(0) || 'F'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#4C1D95' }}>
                            {sel.name} &nbsp;
                            <span style={{ fontSize: '0.75rem', color: '#6B21A8', fontWeight: 600 }}>({sel.id})</span>
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B21A8', display: 'block' }}>
                            📍 {sel.zone} {sel.phone ? `• 📞 ${sel.phone}` : ''}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        size="small"
                        label={sel.assigned === 0 ? '🟢 Available (0 active tasks)' : `🟡 ${sel.assigned} task(s) assigned`}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          bgcolor: '#FFFFFF',
                          border: '1px solid #D8B4FE',
                          color: '#6B21A8',
                        }}
                      />
                    </Paper>
                  );
                })()}

                {officers.length === 0 && (
                  <Alert
                    severity="warning"
                    action={
                      <Button
                        size="small"
                        color="inherit"
                        onClick={() => navigate('/dashboard/lmo/officers')}
                        sx={{ fontWeight: 700 }}
                      >
                        Nominate Officer
                      </Button>
                    }
                  >
                    No Field Officers are currently registered in this circle.
                  </Alert>
                )}
              </Box>
            ) : (
              <FormControl fullWidth required size="small">
                <InputLabel>Select Accredited GATC Test Centre *</InputLabel>
                <Select
                  value={assignModal.gatcUserId}
                  label="Select Accredited GATC Test Centre *"
                  onChange={(e) => setAssignModal({ ...assignModal, gatcUserId: e.target.value })}
                >
                  {((appEligibility?.eligibleGATCs && appEligibility.eligibleGATCs.length > 0) ? appEligibility.eligibleGATCs : gatcCentres).length === 0 ? (
                    <MenuItem value="" disabled>
                      No authorized GATC Test Centres available in this jurisdiction
                    </MenuItem>
                  ) : (
                    ((appEligibility?.eligibleGATCs && appEligibility.eligibleGATCs.length > 0) ? appEligibility.eligibleGATCs : gatcCentres).map((g) => (
                      <MenuItem key={g.dbId || g.id} value={g.dbId || g.id}>
                        {g.name} ({g.gatcCode || g.id}) — Accreditation: {g.accreditationNo || 'NABL Accredited'}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            )}

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
                background: assignModal.assigneeType === 'GATC'
                  ? 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)'
                  : 'linear-gradient(135deg, #7E22CE 0%, #581C87 100%)',
                fontWeight: 700,
                px: 3,
              }}
            >
              {assignModal.submitting
                ? 'Allocating...'
                : assignModal.assigneeType === 'GATC'
                ? 'Assign & Route to GATC Lab'
                : 'Assign & Dispatch FO'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ── DETAIL MODAL ── */}
      <Dialog open={!!selectedApp} onClose={() => setSelectedApp(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1A1A2E' }}>
          Dossier Details — {selectedApp?.appNumber}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {selectedApp && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                {[
                  ['Applicant Name', selectedApp.applicant],
                  ['Premises Address', selectedApp.address],
                  ['Contact Phone', selectedApp.contact],
                  ['Contact Email', selectedApp.contactEmail || '—'],
                  ['Instrument Type', selectedApp.instrument],
                  ['Make & Serial No', `${selectedApp.make} · S/N: ${selectedApp.serial}`],
                  ['Submitted Date', selectedApp.submitted],
                  ['Priority', selectedApp.priority],
                  ['Status', selectedApp.status],
                  ['Assigned Inspector', selectedApp.assignedFoName || 'None assigned yet'],
                  ['Scheduled Visit', selectedApp.scheduledDate ? `${selectedApp.scheduledDate} at ${selectedApp.scheduledTime}` : 'Not scheduled'],
                  ['Certificate No', selectedApp.certificateNo || 'Pending on-site stamping'],
                ].map(([k, v]) => (
                  <Grid item xs={12} sm={6} key={k}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', pb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>{k}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>{v}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>

        {/* Show FO inspection findings for Inspection Reported apps */}
        {selectedApp?.status === 'Inspection Reported' && (
          <Box sx={{ px: 3, pb: 1 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#7E22CE', display: 'block', mb: 1 }}>
              📋 FIELD OFFICER INSPECTION REPORT (Awaiting Your Signature)
            </Typography>
            <Grid container spacing={2}>
              {[
                ['FO Inspector', selectedApp.raw?.stamped_by || 'Not recorded'],
                ['Inspection Date', selectedApp.raw?.inspection_date ? new Date(selectedApp.raw.inspection_date).toLocaleDateString('en-IN') : '—'],
                ['Test Result', selectedApp.raw?.inspection_result || '—'],
                ['Error Margin', selectedApp.raw?.test_error_percentage != null ? `${selectedApp.raw.test_error_percentage}%` : '—'],
                ['Environment', selectedApp.raw?.environmental_temp || '—'],
                ['Security Seal No', selectedApp.raw?.security_seal_no || '—'],
                ['FO Notes', selectedApp.raw?.inspection_notes || '—'],
              ].map(([k, v]) => (
                <Grid item xs={12} sm={6} key={k}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', pb: 1, mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>{k}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', textAlign: 'right', maxWidth: '60%' }}>{String(v)}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Alert severity="info" sx={{ mt: 1, borderRadius: 2, fontSize: '0.78rem' }}>
              As the gazetted Legal Metrology Officer, your signature authorises this certificate under Section 24 of the Legal Metrology Act, 2009.
            </Alert>
          </Box>
        )}

        {/* ── Attached Inspection Evidence & Photographs ── */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 0.75 }}>
              📸 STATUTORY EVIDENCE &amp; INSPECTION PHOTOGRAPHS ({selectedApp?.documents?.length || selectedApp?.raw?.documents?.length || 0})
            </Typography>
            {((selectedApp?.documents?.length || 0) > 0 || (selectedApp?.raw?.documents?.length || 0) > 0) && (
              <Chip
                label="Evidence Available for Verification"
                size="small"
                sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700, fontSize: '0.68rem' }}
              />
            )}
          </Box>

          {((selectedApp?.documents && selectedApp.documents.length > 0) ||
            (selectedApp?.raw?.documents && selectedApp.raw.documents.length > 0)) ? (
            <Grid container spacing={2}>
              {(selectedApp.documents || selectedApp.raw.documents).map((doc) => {
                const isImage = doc.mime_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(doc.file_name);
                const fileUrl = `${API_BASE}${doc.file_path}`;

                return (
                  <Grid item xs={12} sm={6} md={4} key={doc.id}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#7E22CE', boxShadow: '0 4px 12px rgba(126, 34, 206, 0.08)' },
                      }}
                    >
                      <Box
                        onClick={() => setPreviewDoc(doc)}
                        sx={{
                          height: 120,
                          bgcolor: '#F8FAFC',
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        {isImage ? (
                          <img
                            src={fileUrl}
                            alt={doc.file_name}
                            crossOrigin="use-credentials"
                            onError={(e) => {
                              if (fileUrl !== doc.file_path) {
                                e.currentTarget.src = doc.file_path;
                              }
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <InsertDriveFileIcon sx={{ fontSize: 52, color: '#64748B' }} />
                        )}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'rgba(0, 0, 0, 0.65)',
                            color: '#FFFFFF',
                            py: 0.3,
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                            Click to Expand / Inspect
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            label={doc.doc_type?.replace(/_/g, ' ') || 'DOCUMENT'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              bgcolor: doc.doc_type?.includes('SEAL') ? '#FEF3C7' : '#F1F5F9',
                              color: doc.doc_type?.includes('SEAL') ? '#B45309' : '#475569',
                            }}
                          />
                          <IconButton
                            size="small"
                            component="a"
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: '#64748B', p: 0.5 }}
                          >
                            <OpenInNewIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ display: 'block', mt: 0.5, fontWeight: 700, color: '#1E293B' }}
                          noWrap
                          title={doc.file_name}
                        >
                          {doc.file_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem' }}>
                          {(doc.file_size / 1024).toFixed(1)} KB · {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN') : 'Uploaded'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.78rem' }}>
              No photographic evidence or documents uploaded for this application yet.
            </Alert>
          )}
        </Box>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setSelectedApp(null)} sx={{ color: '#64748B' }}>Close</Button>
          {selectedApp?.status === 'Pending' && (
            <>
              <Button onClick={() => handleDirectAction(selectedApp?.id, 'reject')} variant="outlined" color="error" sx={{ fontWeight: 700 }}>
                Reject Application
              </Button>
              <Button onClick={() => handleOpenAssign(selectedApp)} variant="contained" sx={{ background: 'linear-gradient(135deg, #7E22CE 0%, #581C87 100%)', fontWeight: 700 }}>
                Assign Inspector
              </Button>
            </>
          )}
          {selectedApp?.status === 'Inspection Reported' && (
            <>
              <Button
                onClick={() => handleDirectAction(selectedApp?.id, 'correction', 'Non-compliance noted during verification. Re-calibration/adjustment required.')}
                variant="outlined" color="warning" sx={{ fontWeight: 700 }}
              >
                Order Correction / Retest
              </Button>
              <Button
                onClick={() => handleDirectAction(selectedApp?.id, 'reject')}
                variant="outlined" color="error" sx={{ fontWeight: 700 }}
              >
                Reject Report
              </Button>
              <Button
                onClick={() => handleDirectAction(selectedApp?.id, 'approve')}
                variant="contained"
                startIcon={<VerifiedIcon />}
                sx={{ background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)', fontWeight: 700 }}
              >
                Sign & Issue Certificate
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* ── PHOTO / DOCUMENT LIGHTBOX PREVIEW MODAL ── */}
      <Dialog
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ m: 0, p: 2, bgcolor: '#0F172A', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {previewDoc?.file_name}
            </Typography>
            <Chip
              label={previewDoc?.doc_type?.replace(/_/g, ' ')}
              size="small"
              sx={{ bgcolor: '#334155', color: '#F8FAFC', fontWeight: 700, fontSize: '0.7rem' }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              component="a"
              href={`${API_BASE}${previewDoc?.file_path}`}
              target="_blank"
              download
              startIcon={<DownloadIcon />}
              sx={{ color: '#FFFFFF', borderColor: '#475569', fontSize: '0.75rem', textTransform: 'none' }}
            >
              Open Full
            </Button>
            <IconButton onClick={() => setPreviewDoc(null)} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2, bgcolor: '#020617', textAlign: 'center', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {previewDoc?.mime_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(previewDoc?.file_name || '') ? (
            <img
              src={`${API_BASE}${previewDoc?.file_path}`}
              alt={previewDoc?.file_name}
              crossOrigin="use-credentials"
              onError={(e) => {
                if (previewDoc?.file_path && e.currentTarget.src !== previewDoc.file_path) {
                  e.currentTarget.src = previewDoc.file_path;
                }
              }}
              style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: 4 }}
            />
          ) : (
            <Box sx={{ p: 4, color: '#94A3B8' }}>
              <InsertDriveFileIcon sx={{ fontSize: 80, mb: 1 }} />
              <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                {previewDoc?.file_name}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                PDF or non-image document. Click &quot;Open Full&quot; above to view or download.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
