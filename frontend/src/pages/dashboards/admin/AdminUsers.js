import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Button, Avatar, IconButton, Tooltip, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, Alert, Card, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import KeyIcon from '@mui/icons-material/Key';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import GavelIcon from '@mui/icons-material/Gavel';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';


const COLOR = '#B71C1C';
const GRADIENT = 'linear-gradient(135deg, #C62828 0%, #B71C1C 100%)';

const roleColor = {
  user: { color: '#E65100', bg: '#FFF3E0' },
  lmo: { color: '#2E7D32', bg: '#E8F5E9' },
  field_officer: { color: '#4A148C', bg: '#F3E5F5' },
  admin: { color: '#B71C1C', bg: '#FFEBEE' },
};
const roleLabel = { user: 'Public User', lmo: 'LMO Officer', field_officer: 'Field Officer', admin: 'Admin' };

// Initial Fallback Mock Users
const INITIAL_USERS = [
  { id: '1', name: 'Dr. R. K. Mathur', email: 'admin@example.com', role: 'admin', verified: true, joined: '14 Sep 2026', status: 'ACTIVE', employeeCode: 'ADM-DEL-01' },
  { id: '2', name: 'Shri Rajesh Kumar', email: 'rajesh@example.com', role: 'lmo', verified: true, joined: '05 Sep 2026', status: 'ACTIVE', employeeCode: 'LMO-DEL-04', assignedJurisdiction: 'Delhi North Division', dscKeyId: 'DSC-DL-2026-SHA256' },
  { id: '3', name: 'Inspector Anjali Singh', email: 'anjali@example.com', role: 'field_officer', verified: true, joined: '01 Sep 2026', status: 'ACTIVE', employeeCode: 'FO-DEL-102', assignedJurisdiction: 'Karol Bagh Circle - North Delhi' },
  { id: '4', name: 'Inspector Vikram Malhotra', email: 'vikram.fo@gov.in', role: 'field_officer', verified: false, joined: '22 Sep 2026', status: 'PENDING_VERIFICATION', employeeCode: 'FO-DEL-105', assignedJurisdiction: 'Rohini Sector 14 Circle' },
  { id: '5', name: 'Inspector Neha Joshi', email: 'neha.fo@gov.in', role: 'field_officer', verified: false, joined: '20 Sep 2026', status: 'PENDING_ACTIVATION', employeeCode: 'FO-DEL-106', assignedJurisdiction: 'Chandni Chowk Zone', activationToken: 'ACT-FO-9E41-7B22' },
  { id: '6', name: 'Priya Sharma (Trader)', email: 'priya@example.com', role: 'user', verified: true, joined: '10 Sep 2026', status: 'ACTIVE' },
  { id: '7', name: 'Mohit Gupta', email: 'mohit@example.com', role: 'user', verified: false, joined: '20 Aug 2026', status: 'UNVERIFIED' },
];

export default function AdminUsers() {
  const [tabIndex, setTabIndex] = useState(0);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // LMO Appointment Modal State
  const [openAppointLMO, setOpenAppointLMO] = useState(false);
  const [lmoForm, setLmoForm] = useState({
    name: '',
    email: '',
    phone: '',
    employeeCode: '',
    gazetteOrderRef: '',
    state: 'Delhi',
    district: 'North Delhi',
    zone: 'Zone 1 (Civil Lines & Sadar)',
    dscKeyId: '',
  });

  // Officer Clearance Modal State
  const [pendingOfficers, setPendingOfficers] = useState([]);
  const [generatedTokenModal, setGeneratedTokenModal] = useState({
    open: false,
    officer: null,
    token: '',
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);

  // Role Edit Dialog State
  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  // Fetch data on load and on tab change
  const refreshData = async () => {
    setLoading(true);
    try {
      // 1. Fetch system users
      const usersRes = await fetch('http://localhost:5000/api/admin/users', { credentials: 'include' });
      if (usersRes.ok) {
        const data = await usersRes.json();
        if (data.users && data.users.length > 0) setUsers(data.users);
      }

      // 2. Fetch pending officers
      const officersRes = await fetch('http://localhost:5000/api/admin/officers/pending-approvals', { credentials: 'include' });
      if (officersRes.ok) {
        const offData = await officersRes.json();
        setPendingOfficers(offData.officers || []);
      }

      // 3. Fetch audit logs
      const logsRes = await fetch('http://localhost:5000/api/admin/audit-logs', { credentials: 'include' });
      if (logsRes.ok) {
        const logData = await logsRes.json();
        setAuditLogs(logData.logs || []);
      }
    } catch (err) {
      console.warn('Backend sync warning (using cached data):', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [tabIndex]);

  // Generate simulated DSC Key for LMO
  const generateDscKey = () => {
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const key = `DSC-${lmoForm.state.substring(0, 2).toUpperCase()}-2026-${randomHex}-SHA256`;
    setLmoForm((prev) => ({ ...prev, dscKeyId: key }));
  };

  // Submit LMO Appointment
  const handleAppointLMOSubmit = async (e) => {
    e.preventDefault();
    if (!lmoForm.name || !lmoForm.email || !lmoForm.employeeCode || !lmoForm.gazetteOrderRef) {
      setFeedback({ type: 'error', message: 'All mandatory fields including Gazette Reference must be completed.' });
      return;
    }

    const payload = {
      ...lmoForm,
      dscKeyId: lmoForm.dscKeyId || `DSC-${lmoForm.state.substring(0, 2).toUpperCase()}-2026-SHA256`,
      jurisdiction: `${lmoForm.district}, ${lmoForm.state} (${lmoForm.zone})`,
    };

    try {
      const res = await fetch('http://localhost:5000/api/admin/lmo/appoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `LMO ${payload.name} gazetted successfully with DSC: ${payload.dscKeyId}. Default temporary password: ${data.lmo?.defaultPassword || 'LmoPassword2026!'}`,
        });
        setOpenAppointLMO(false);
        setLmoForm({
          name: '',
          email: '',
          phone: '',
          employeeCode: '',
          gazetteOrderRef: '',
          state: 'Delhi',
          district: 'North Delhi',
          zone: 'Zone 1 (Civil Lines & Sadar)',
          dscKeyId: '',
        });
        refreshData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to appoint LMO.' });
      }
    } catch (err) {
      // Fallback update
      const newMockLmo = {
        id: Date.now().toString(),
        name: payload.name,
        email: payload.email,
        role: 'lmo',
        verified: true,
        status: 'ACTIVE',
        employeeCode: payload.employeeCode,
        gazetteOrderRef: payload.gazetteOrderRef,
        assignedJurisdiction: payload.jurisdiction,
        dscKeyId: payload.dscKeyId,
        joined: 'Just now',
      };
      setUsers((prev) => [newMockLmo, ...prev]);
      setFeedback({ type: 'success', message: `LMO ${payload.name} appointed successfully (Local Registry).` });
      setOpenAppointLMO(false);
    }
  };

  // Clear or Reject Field Inspector
  const handleClearanceAction = async (officerId, action) => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/officers/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ officerId, action }),
      });
      const data = await res.json();

      if (res.ok) {
        if (action === 'approve') {
          const officer = pendingOfficers.find((o) => o.id === officerId);
          setGeneratedTokenModal({
            open: true,
            officer: officer || { name: 'Field Inspector' },
            token: data.activationToken,
          });
          setFeedback({
            type: 'success',
            message: `Inspector cleared! Single-use activation token generated: ${data.activationToken}`,
          });
        } else {
          setFeedback({ type: 'info', message: 'Nomination returned for service re-verification.' });
        }
        refreshData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Clearance operation failed.' });
      }
    } catch (err) {
      if (action === 'approve') {
        const dummyToken = `ACT-FO-${Math.random().toString(16).substring(2, 6).toUpperCase()}-${Math.random().toString(16).substring(2, 6).toUpperCase()}`;
        setGeneratedTokenModal({
          open: true,
          officer: { name: 'Inspector' },
          token: dummyToken,
        });
        setPendingOfficers((prev) =>
          prev.map((o) => (o.id === officerId ? { ...o, status: 'PENDING_ACTIVATION', activationToken: dummyToken } : o))
        );
      }
    }
  };

  // Toggle user suspension
  const toggleSuspend = async (user) => {
    const nextStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await fetch('http://localhost:5000/api/admin/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: user.id, status: nextStatus }),
      });
      refreshData();
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
    }
  };

  // Copy token helper
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Activation Token "${text}" copied to clipboard! Share securely with the Field Officer.`);
  };

  // Filtered lists
  const filteredUsers = users.filter((u) =>
    (roleFilter === 'All' || u.role === roleFilter) &&
    (u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const lmoRegistry = users.filter((u) => u.role === 'lmo');

  const pendingApprovalsList = pendingOfficers.length > 0
    ? pendingOfficers
    : users.filter((u) => u.role === 'field_officer');

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* ── Top Header Banner ── */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Chip
              label="STATE DIRECTORATE CENTRAL ADMINISTRATION"
              size="small"
              sx={{ bgcolor: '#FFEBEE', color: COLOR, fontWeight: 800, fontSize: '0.68rem', borderRadius: '6px' }}
            />
            <Typography variant="caption" sx={{ color: '#757575', fontWeight: 600 }}>
              Statutory Provisioning &amp; Clearance Architecture
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E', letterSpacing: '-0.02em' }}>
            Government Identity &amp; Credential Hierarchy
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>
            Supervise District LMOs, verify Field Inspector dossiers, and audit officer authorizations.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            disabled={loading}
            startIcon={<RefreshIcon />}
            onClick={refreshData}
            sx={{ borderRadius: 2, borderColor: '#CFD8DC', color: '#37474F', fontWeight: 700 }}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>

          <Button
            variant="contained"
            startIcon={<GavelIcon />}
            onClick={() => setOpenAppointLMO(true)}
            sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700, px: 3, boxShadow: '0 4px 14px rgba(183, 28, 28, 0.35)' }}
          >
            Appoint District LMO
          </Button>
        </Box>
      </Box>

      {/* Feedback Alert */}
      {feedback.message && (
        <Alert
          severity={feedback.type || 'info'}
          onClose={() => setFeedback({ type: '', message: '' })}
          sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
        >
          {feedback.message}
        </Alert>
      )}

      {/* ── Hierarchy Navigation Tabs ── */}
      <Paper elevation={0} sx={{ mb: 3.5, borderRadius: 3, border: '1px solid #E0E0E0', bgcolor: '#FFFFFF' }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.92rem', minHeight: 56 },
            '& .Mui-selected': { color: `${COLOR} !important` },
            '& .MuiTabs-indicator': { bgcolor: COLOR, height: 3 },
          }}
        >
          <Tab
            icon={<GavelIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={`LMO Commissioning & Registry (${lmoRegistry.length})`}
          />
          <Tab
            icon={<SecurityIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={`Inspector Security Clearances (${pendingApprovalsList.filter(o => o.status === 'PENDING_VERIFICATION').length} Pending)`}
          />
          <Tab
            icon={<PeopleIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={`All System Users (${users.length})`}
          />
          <Tab
            icon={<HistoryIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Statutory Audit Trail"
          />
        </Tabs>
      </Paper>

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 0: LMO COMMISSIONING & REGISTRY
      ═══════════════════════════════════════════════════════════════════ */}
      {tabIndex === 0 && (
        <Box>
          {/* Quick Metrics */}
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            <Grid item xs={12} sm={4}>
              <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #C8E6C9', bgcolor: '#F1F8E9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <GavelIcon sx={{ color: '#2E7D32' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2E7D32' }}>Gazetted LMOs</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1B5E20' }}>{lmoRegistry.length}</Typography>
                <Typography variant="caption" sx={{ color: '#558B2F', fontWeight: 600 }}>Active District Jurisdictions</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #BBDEFB', bgcolor: '#E3F2FD' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <VerifiedUserIcon sx={{ color: '#1565C0' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1565C0' }}>Class-3 DSC Keys</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0D47A1' }}>{lmoRegistry.length}</Typography>
                <Typography variant="caption" sx={{ color: '#1976D2', fontWeight: 600 }}>Active Cryptographic Certificates</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #FFE0B2', bgcolor: '#FFF3E0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <LocationCityIcon sx={{ color: '#E65100' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#E65100' }}>Territorial Coverage</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#BF360C' }}>100%</Typography>
                <Typography variant="caption" sx={{ color: '#E65100', fontWeight: 600 }}>State Divisions Bound</Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Registry Table */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FAFAFA', borderBottom: '1px solid #EEEEEE' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A1A2E' }}>Gazetted Legal Metrology Officers Registry</Typography>
                <Typography variant="body2" sx={{ color: '#757575' }}>Authorized officers with territorial jurisdiction and DSC stamping authority</Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<GavelIcon />}
                onClick={() => setOpenAppointLMO(true)}
                sx={{ background: GRADIENT, fontWeight: 700 }}
              >
                Appoint LMO
              </Button>
            </Box>

            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Designated Officer</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Employee ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Gazette Notification</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Jurisdiction Boundary</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Class-3 DSC Key</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lmoRegistry.map((lmo) => (
                    <TableRow key={lmo.id || lmo.email} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 38, height: 38, bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 800 }}>
                            {lmo.name?.charAt(0) || 'L'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E' }}>{lmo.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#757575' }}>{lmo.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={lmo.employeeCode || 'LMO-DEL-04'} size="small" sx={{ fontWeight: 700, bgcolor: '#EDE7F6', color: '#512DA8' }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#37474F' }}>
                        {lmo.gazetteOrderRef || 'GOV/NOTIF/2026/89'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationCityIcon sx={{ fontSize: 16, color: '#1565C0' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1565C0' }}>
                            {lmo.assignedJurisdiction || 'Delhi North Division'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Class-3 Simulated Digital Signature Key">
                          <Chip
                            icon={<KeyIcon sx={{ fontSize: '14px !important' }} />}
                            label={lmo.dscKeyId || 'DSC-DL-2026-SHA256'}
                            size="small"
                            sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700, fontSize: '0.72rem' }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={lmo.status || 'ACTIVE'}
                          size="small"
                          sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 800, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {lmoRegistry.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#757575' }}>
                        No LMOs commissioned yet. Click "Appoint District LMO" to commission the first officer.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 1: INSPECTOR SECURITY CLEARANCE QUEUE
      ═══════════════════════════════════════════════════════════════════ */}
      {tabIndex === 1 && (
        <Box>
          <Box sx={{ mb: 3, p: 2.5, bgcolor: '#FFF8E1', borderRadius: 3, border: '1px solid #FFE082', display: 'flex', alignItems: 'center', gap: 2 }}>
            <SecurityIcon sx={{ color: '#F57F17', fontSize: 32 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#F57F17' }}>
                Multi-Tier Security &amp; HRMS Clearance Queue
              </Typography>
              <Typography variant="body2" sx={{ color: '#5D4037' }}>
                Field Inspectors nominated by District LMOs must be verified by the State Directorate. Approved inspectors are issued a cryptographic single-use activation token to bind their testing hardware.
              </Typography>
            </Box>
          </Box>

          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Nominated Inspector</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Recommending LMO</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Assigned Geofenced Circle</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Submission / Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Activation Token</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Clearance Audit Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingApprovalsList.map((fo) => {
                    const isPending = fo.status === 'PENDING_VERIFICATION';
                    const isCleared = fo.status === 'PENDING_ACTIVATION';
                    const isActive = fo.status === 'ACTIVE';

                    return (
                      <TableRow key={fo.id || fo.email} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#F3E5F5', color: '#4A148C', fontWeight: 800 }}>
                              {fo.name?.charAt(0) || 'F'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E' }}>{fo.name}</Typography>
                              <Typography variant="caption" sx={{ color: '#757575' }}>
                                {fo.employeeCode || 'FO-DEL-GEN'} · {fo.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2E7D32' }}>
                            {fo.recommendingLmo || 'Shri Rajesh Kumar (North Delhi)'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#757575' }}>District LMO Office</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={fo.assignedJurisdiction || 'Karol Bagh Circle'}
                            size="small"
                            sx={{ bgcolor: '#EDE7F6', color: '#4A148C', fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              isPending
                                ? 'Pending Admin Clearance'
                                : isCleared
                                ? 'Clearance Issued (Pending Activation)'
                                : isActive
                                ? 'Active & Bound'
                                : fo.status
                            }
                            size="small"
                            sx={{
                              bgcolor: isPending ? '#FFF8E1' : isCleared ? '#E3F2FD' : '#E8F5E9',
                              color: isPending ? '#F57F17' : isCleared ? '#1565C0' : '#2E7D32',
                              fontWeight: 800,
                              fontSize: '0.68rem',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {fo.activationToken ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 800, bgcolor: '#ECEFF1', px: 1, py: 0.4, borderRadius: 1 }}>
                                {fo.activationToken}
                              </Typography>
                              <Tooltip title="Copy Token">
                                <IconButton size="small" onClick={() => copyToClipboard(fo.activationToken)}>
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Not generated</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {isPending ? (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleClearanceAction(fo.id, 'approve')}
                                sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' }, fontWeight: 700, fontSize: '0.75rem' }}
                              >
                                Authorize Token
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                onClick={() => handleClearanceAction(fo.id, 'reject')}
                                sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                              >
                                Reject
                              </Button>
                            </Box>
                          ) : isCleared ? (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<KeyIcon />}
                              onClick={() =>
                                setGeneratedTokenModal({
                                  open: true,
                                  officer: fo,
                                  token: fo.activationToken || 'ACT-FO-9E41-7B22',
                                })
                              }
                              sx={{ color: '#1565C0', borderColor: '#90CAF9', fontWeight: 700, fontSize: '0.75rem' }}
                            >
                              View Token Dossier
                            </Button>
                          ) : (
                            <Chip
                              icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                              label="Active / Verified"
                              size="small"
                              sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700 }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 2: ALL SYSTEM USERS
      ═══════════════════════════════════════════════════════════════════ */}
      {tabIndex === 2 && (
        <Box>
          {/* Summary Chips */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
            {Object.entries(roleLabel).map(([role, label]) => (
              <Chip
                key={role}
                label={`${label}: ${users.filter((u) => u.role === role).length}`}
                sx={{ bgcolor: roleColor[role]?.bg, color: roleColor[role]?.color, fontWeight: 700 }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by name, email, or employee code..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
              sx={{ minWidth: 320, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Role Filter</InputLabel>
              <Select value={roleFilter} label="Role Filter" onChange={(e) => setRoleFilter(e.target.value)} sx={{ borderRadius: 2 }}>
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
                    {['User', 'Email', 'Role', 'Jurisdiction / Zone', 'Security Credential', 'Status', 'Actions'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, color: '#424242', fontSize: '0.8rem' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id || u.email} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: roleColor[u.role]?.bg, color: roleColor[u.role]?.color, fontSize: '0.75rem', fontWeight: 700 }}>
                            {u.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.83rem' }}>{u.name}</Typography>
                            {u.employeeCode && (
                              <Typography variant="caption" sx={{ color: '#757575', display: 'block' }}>{u.employeeCode}</Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: '#616161' }}>{u.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={roleLabel[u.role] || u.role}
                          size="small"
                          sx={{ bgcolor: roleColor[u.role]?.bg, color: roleColor[u.role]?.color, fontWeight: 700, fontSize: '0.68rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: '#455A64' }}>
                        {u.assignedJurisdiction || '—'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        {u.dscKeyId ? (
                          <Chip label={`DSC: ${u.dscKeyId.slice(0, 14)}...`} size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700 }} />
                        ) : (
                          <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Standard</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.status || (u.verified ? 'Active' : 'Unverified')}
                          size="small"
                          sx={{
                            bgcolor: u.status === 'ACTIVE' || u.status === 'Active' ? '#E8F5E9' : u.status === 'SUSPENDED' ? '#FFEBEE' : '#FFF8E1',
                            color: u.status === 'ACTIVE' || u.status === 'Active' ? '#2E7D32' : u.status === 'SUSPENDED' ? '#B71C1C' : '#F57F17',
                            fontWeight: 700,
                            fontSize: '0.68rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Change Role">
                            <IconButton size="small" onClick={() => { setEditUser(u); setNewRole(u.role); }} sx={{ color: '#1565C0', '&:hover': { bgcolor: '#E3F2FD' } }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={u.status === 'SUSPENDED' ? 'Unsuspend' : 'Suspend'}>
                            <IconButton size="small" onClick={() => toggleSuspend(u)} sx={{ color: u.status === 'SUSPENDED' ? '#2E7D32' : '#B71C1C' }}>
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
        </Box>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 3: STATUTORY SECURITY AUDIT TRAIL
      ═══════════════════════════════════════════════════════════════════ */}
      {tabIndex === 3 && (
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, bgcolor: '#FAFAFA', borderBottom: '1px solid #EEEEEE' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A1A2E' }}>
              Statutory Security Audit &amp; Provisioning Log
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Immutable record of all appointments, vigilance clearances, and officer authorizations.
            </Typography>
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Security Event</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actor</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Target Entity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Dossier Particulars</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ fontSize: '0.78rem', color: '#616161', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString('en-GB')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          bgcolor: log.action.includes('CLEARANCE') ? '#E3F2FD' : log.action.includes('LMO') ? '#E8F5E9' : '#EDE7F6',
                          color: log.action.includes('CLEARANCE') ? '#1565C0' : log.action.includes('LMO') ? '#2E7D32' : '#512DA8',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{log.actor}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#455A64' }}>{log.target || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#37474F' }}>{log.details}</TableCell>
                  </TableRow>
                ))}
                {auditLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#757575' }}>
                      No audit records found. Appointments and clearances will appear here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}

      {/* ── MODAL 1: APPOINT LEGAL METROLOGY OFFICER ── */}
      <Dialog open={openAppointLMO} onClose={() => setOpenAppointLMO(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <GavelIcon sx={{ color: COLOR }} />
          Commission Legal Metrology Officer (LMO) with Gazette &amp; DSC
        </DialogTitle>
        <Divider />
        <Box component="form" onSubmit={handleAppointLMOSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Statutory Provisioning: An appointed LMO receives jurisdictional authority over a District, accompanied by a Class-3 Digital Signature Certificate (DSC) key for statutory stamp issuance.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Officer Full Name"
                  fullWidth
                  required
                  placeholder="e.g. Shri Rajesh Kumar"
                  value={lmoForm.name}
                  onChange={(e) => setLmoForm({ ...lmoForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Official Government Email"
                  type="email"
                  fullWidth
                  required
                  placeholder="name@lm.gov.in"
                  value={lmoForm.email}
                  onChange={(e) => setLmoForm({ ...lmoForm, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Government Employee ID / Code"
                  fullWidth
                  required
                  placeholder="e.g. LMO-DEL-08"
                  value={lmoForm.employeeCode}
                  onChange={(e) => setLmoForm({ ...lmoForm, employeeCode: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Gazette Notification Order Ref"
                  fullWidth
                  required
                  placeholder="e.g. GOV/NOTIF/2026/89"
                  value={lmoForm.gazetteOrderRef}
                  onChange={(e) => setLmoForm({ ...lmoForm, gazetteOrderRef: e.target.value })}
                />
              </Grid>

              {/* Jurisdiction Selectors */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>State Jurisdiction</InputLabel>
                  <Select
                    value={lmoForm.state}
                    label="State Jurisdiction"
                    onChange={(e) => setLmoForm({ ...lmoForm, state: e.target.value })}
                  >
                    <MenuItem value="Delhi">Delhi (NCT)</MenuItem>
                    <MenuItem value="Maharashtra">Maharashtra</MenuItem>
                    <MenuItem value="Karnataka">Karnataka</MenuItem>
                    <MenuItem value="Uttar Pradesh">Uttar Pradesh</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>District Division</InputLabel>
                  <Select
                    value={lmoForm.district}
                    label="District Division"
                    onChange={(e) => setLmoForm({ ...lmoForm, district: e.target.value })}
                  >
                    <MenuItem value="North Delhi">North Delhi</MenuItem>
                    <MenuItem value="South Delhi">South Delhi</MenuItem>
                    <MenuItem value="East Delhi">East Delhi</MenuItem>
                    <MenuItem value="West Delhi">West Delhi</MenuItem>
                    <MenuItem value="Central Delhi">Central Delhi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Sub-Division Circles</InputLabel>
                  <Select
                    value={lmoForm.zone}
                    label="Sub-Division Circles"
                    onChange={(e) => setLmoForm({ ...lmoForm, zone: e.target.value })}
                  >
                    <MenuItem value="Zone 1 (Civil Lines & Sadar)">Zone 1 (Civil Lines &amp; Sadar)</MenuItem>
                    <MenuItem value="Zone 2 (Karol Bagh & Narela)">Zone 2 (Karol Bagh &amp; Narela)</MenuItem>
                    <MenuItem value="Zone 3 (Rohini & Pitampura)">Zone 3 (Rohini &amp; Pitampura)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* DSC Key Enrollment */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#FAFAFA', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <KeyIcon sx={{ color: '#2E7D32', fontSize: 18 }} />
                    Simulated Class-3 Digital Signature Key (DSC)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="DSC-DL-2026-SHA256-XXXX"
                      value={lmoForm.dscKeyId}
                      onChange={(e) => setLmoForm({ ...lmoForm, dscKeyId: e.target.value })}
                    />
                    <Button
                      variant="outlined"
                      onClick={generateDscKey}
                      sx={{ whiteSpace: 'nowrap', fontWeight: 700, borderColor: '#81C784', color: '#2E7D32' }}
                    >
                      Generate Key
                    </Button>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#757575', mt: 0.5, display: 'block' }}>
                    Will be enrolled into Government Certificate Stamping HSM for this Officer.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button onClick={() => setOpenAppointLMO(false)} sx={{ color: '#757575' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ background: GRADIENT, fontWeight: 700, px: 3 }}>
              Commission &amp; Issue DSC
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ── MODAL 2: ACTIVATION TOKEN GENERATED HANDOVER ── */}
      <Dialog
        open={generatedTokenModal.open}
        onClose={() => setGeneratedTokenModal({ open: false, officer: null, token: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1565C0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <KeyIcon /> Security Clearance Granted &amp; Activation Token
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
            Field Inspector dossier verified! Single-use activation token has been generated.
          </Alert>

          <Paper sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 2.5, border: '1.5px dashed #90CAF9', textAlign: 'center', mb: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: 1 }}>
              SINGLE-USE ACTIVATION TOKEN
            </Typography>
            <Typography variant="h4" sx={{ fontFamily: 'monospace', fontWeight: 900, color: '#0F2B4E', my: 1, letterSpacing: 2 }}>
              {generatedTokenModal.token}
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={() => copyToClipboard(generatedTokenModal.token)}
              sx={{ bgcolor: '#0F2B4E', fontWeight: 700, mt: 0.5 }}
            >
              Copy Token
            </Button>
          </Paper>

          <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#37474F', mb: 1 }}>
              Inspector Handover Instructions:
            </Typography>
            <Typography variant="body2" sx={{ color: '#546E7A', mb: 0.5 }}>
              1. Provide this token to Inspector <strong>{generatedTokenModal.officer?.name || 'the Field Officer'}</strong>.
            </Typography>
            <Typography variant="body2" sx={{ color: '#546E7A', mb: 0.5 }}>
              2. The officer visits the portal login page under <strong>Field Officer</strong> and clicks <em>"Activate Inspector Account"</em>.
            </Typography>
            <Typography variant="body2" sx={{ color: '#546E7A' }}>
              3. Upon entering the token and setting their password, their inspector credentials are activated for field operations.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            onClick={() => setGeneratedTokenModal({ open: false, officer: null, token: '' })}
            sx={{ fontWeight: 700 }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL 3: CHANGE USER ROLE ── */}
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
          <Button
            variant="contained"
            sx={{ background: GRADIENT, fontWeight: 700 }}
            onClick={async () => {
              try {
                await fetch('http://localhost:5000/api/admin/users/status', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ userId: editUser.id, role: newRole }),
                });
                refreshData();
              } catch {
                setUsers((prev) => prev.map((u) => (u.id === editUser.id ? { ...u, role: newRole } : u)));
              }
              setEditUser(null);
            }}
          >
            Save Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
