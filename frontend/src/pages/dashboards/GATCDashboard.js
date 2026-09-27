import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Button, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

const COLOR = '#0D9488';
const GRADIENT = 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)';

export default function GATCDashboard({ userEmail }) {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedTests: 0,
    totalAssigned: 0,
    centreName: 'Government Approved Test Centre',
    gatcCode: 'GATC-DL-01',
    accreditationNo: 'NABL/GATC/2026/894',
    accreditationValidUntil: '2028-12-31',
    authorizedScopes: 'Weighbridges, Flow Meters, Fuel Dispensers, Platform Balances',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Inspection Modal State
  const [inspectModal, setInspectModal] = useState({
    open: false,
    task: null,
    testError: '0.012',
    envTemp: '23°C, 45% RH (Controlled Lab)',
    workingStandards: 'NABL Traceable Class M1/E2 Weights (Ref: NPL/CAL/2025/11)',
    testObservations: '',
    securitySealNo: '',
    result: 'Pass',
    notes: 'Laboratory verification test completed according to Legal Metrology General Rules.',
    file: null,
    submitting: false,
  });

  // Certificate Modal State
  const [viewCertModal, setViewCertModal] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, statsRes, histRes] = await Promise.all([
        fetch('http://localhost:5000/api/gatc/tasks', { credentials: 'include' }),
        fetch('http://localhost:5000/api/gatc/stats', { credentials: 'include' }),
        fetch('http://localhost:5000/api/gatc/history', { credentials: 'include' }),
      ]);

      const tasksData = await tasksRes.json();
      const statsData = await statsRes.json();
      const histData = await histRes.json();

      if (tasksData.tasks) setTasks(tasksData.tasks);
      if (statsData.stats) setStats(statsData.stats);
      if (histData.reports) setHistory(histData.reports);
    } catch {
      setError('Unable to communicate with GATC Testing Centre services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenInspect = (task) => {
    setInspectModal({
      open: true,
      task,
      testError: '0.012',
      envTemp: '23°C, 45% RH (Controlled Lab)',
      workingStandards: 'NABL Traceable Class M1/E2 Weights (Ref: NPL/CAL/2025/11)',
      testObservations: `Repeatability Test: Within 0.01%. Zero load error: 0.00%. Eccentricity: Pass. Tested at 25%, 50%, 100% capacity of ${task.capacity}.`,
      securitySealNo: `GATC-SEAL-${Math.floor(100000 + Math.random() * 900000)}`,
      result: 'Pass',
      notes: `Verified against working standards. MPE is within permissible limits for ${task.instrumentType}. Tamper-proof polycarbonate GATC seal affixed.`,
      file: null,
      submitting: false,
    });
  };

  const handleConfirmInspect = async (e) => {
    e.preventDefault();
    if (!inspectModal.task) return;

    setInspectModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/gatc/applications/${inspectModal.task.id}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          test_error_percentage: inspectModal.testError,
          environmental_temp: inspectModal.envTemp,
          working_standards_used: inspectModal.workingStandards,
          test_observations: inspectModal.testObservations,
          security_seal_no: inspectModal.securitySealNo,
          inspection_result: inspectModal.result,
          inspection_notes: inspectModal.notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (inspectModal.file) {
          const formData = new FormData();
          formData.append('file', inspectModal.file);
          formData.append('doc_type', 'GATC_TEST_REPORT');
          formData.append('application_id', inspectModal.task.id);
          await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });
        }

        setSuccess(`GATC Verification Report submitted! Test observations and seal details forwarded to LMO for statutory Form D endorsement.`);
        setInspectModal({ open: false, task: null, testError: '', envTemp: '', workingStandards: '', testObservations: '', securitySealNo: '', result: 'Pass', notes: '', file: null, submitting: false });
        fetchData();
      } else {
        setError(data.error || 'Failed to submit GATC test report.');
      }
    } catch {
      setError('Communication failure with test centre service.');
    } finally {
      setInspectModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const statCards = [
    {
      label: 'Testing Queue',
      value: tasks.length,
      detail: 'Assigned for laboratory test',
      icon: PendingActionsRoundedIcon,
      color: '#0D9488',
      bg: '#F0FDFA',
      border: '#99F6E4',
      path: '/dashboard/gatc/tasks',
    },
    {
      label: 'Completed Tests',
      value: stats.completedTests,
      detail: 'Reports submitted to LMO',
      icon: CheckCircleRoundedIcon,
      color: '#16A34A',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      path: '/dashboard/gatc/history',
    },
    {
      label: 'Accreditation Status',
      value: 'NABL CERTIFIED',
      detail: stats.accreditationNo,
      icon: ScienceRoundedIcon,
      color: '#0284C7',
      bg: '#EFF6FF',
      border: '#BFDBFE',
    },
    {
      label: 'Authorized Scopes',
      value: '4 DOMAINS',
      detail: 'High-Capacity & Flow',
      icon: FactCheckRoundedIcon,
      color: '#7E22CE',
      bg: '#FAF5FF',
      border: '#E9D5FF',
    },
  ];

  return (
    <Box sx={{ pb: 4 }}>
      {/* ── Header Banner ── */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label="GOVERNMENT APPROVED TEST CENTRE (GATC)"
              size="small"
              sx={{
                bgcolor: '#F0FDFA',
                color: '#0D9488',
                border: '1px solid #99F6E4',
                fontWeight: 800,
                fontSize: '0.68rem',
                borderRadius: '6px',
              }}
            />
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important' }} />}
              label={`ACCREDITED: ${stats.gatcCode}`}
              size="small"
              sx={{
                bgcolor: '#F0FDF4',
                color: '#15803D',
                border: '1px solid #BBF7D0',
                fontWeight: 800,
                fontSize: '0.68rem',
                borderRadius: '6px',
              }}
            />
          </Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, color: '#0F172A', fontSize: { xs: '1.5rem', sm: '1.9rem' } }}
          >
            {stats.centreName}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Authorized Scopes: <strong>{stats.authorizedScopes}</strong> &nbsp;|&nbsp; Logged in: <strong>{userEmail}</strong>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={fetchData}
            sx={{ borderColor: '#E2E8F0', color: '#475569', fontWeight: 700 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<PendingActionsRoundedIcon />}
            onClick={() => navigate('/dashboard/gatc/tasks')}
            sx={{ background: GRADIENT, fontWeight: 700 }}
          >
            Go to Testing Queue ({tasks.length})
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* ── 4 KPI Stats ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 4,
        }}
      >
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Paper
              key={s.label}
              elevation={0}
              onClick={() => s.path && navigate(s.path)}
              sx={{
                p: 3,
                borderRadius: '18px',
                border: '1.5px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
                cursor: s.path ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                '&:hover': s.path ? { borderColor: s.color, transform: 'translateY(-2px)' } : {},
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    bgcolor: s.bg,
                    border: `1px solid ${s.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: s.color,
                  }}
                >
                  <Icon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.72rem' }}>
                  {s.detail}
                </Typography>
              </Box>

              <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '2rem', mb: 0.5 }}>
                {loading ? <CircularProgress size={24} sx={{ color: s.color }} /> : s.value}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                {s.label}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* ── Accreditation & Laboratory Standards Card ── */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: '20px',
          border: '1.5px solid #99F6E4',
          bgcolor: '#F0FDFA',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F766E', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
          🏛️ Statutory Accreditation &amp; Laboratory Authorisation
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>NABL Accreditation No.</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>{stats.accreditationNo}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Accreditation Validity</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>Until {stats.accreditationValidUntil}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>GATC Identification Code</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0D9488', fontFamily: 'monospace' }}>{stats.gatcCode}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Testing Queue Section Preview ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          mb: 4,
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Active Testing Queue ({tasks.length})
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              High-capacity &amp; specialized instruments allocated by Legal Metrology Officers for testing
            </Typography>
          </Box>

          <Button
            size="small"
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '1rem !important' }} />}
            onClick={() => navigate('/dashboard/gatc/tasks')}
            sx={{ color: '#0D9488', fontWeight: 700, textTransform: 'none' }}
          >
            View Full Queue ({tasks.length})
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress sx={{ color: COLOR }} /></Box>
        ) : tasks.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <ScienceRoundedIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
            <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 600 }}>
              No instruments currently pending in testing queue.
            </Typography>
          </Box>
        ) : (
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>APPLICATION NO.</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>APPLICANT / BUSINESS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>INSTRUMENT SPECIFICATION</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>SERIAL NO.</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>SCHEDULED</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.slice(0, 5).map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell sx={{ fontWeight: 800, color: COLOR }}>{t.appNumber}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{t.businessName}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>{t.contactName} ({t.contactPhone})</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.instrumentType}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>{t.make} · Capacity: {t.capacity}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.serialNo}</TableCell>
                  <TableCell>
                    <Chip label={`${t.scheduledDate} ${t.scheduledTime}`} size="small" sx={{ bgcolor: '#F1F5F9', fontWeight: 600, fontSize: '0.72rem' }} />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ScienceRoundedIcon />}
                      onClick={() => handleOpenInspect(t)}
                      sx={{
                        background: GRADIENT,
                        fontWeight: 700,
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        px: 2,
                      }}
                    >
                      Record Test
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* ── GATC Testing History Section Preview ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Recent Laboratory Verification History ({history.length})
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Completed tests, calibration error percentages, and endorsed Form D statutory certificates
            </Typography>
          </Box>

          <Button
            size="small"
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '1rem !important' }} />}
            onClick={() => navigate('/dashboard/gatc/history')}
            sx={{ color: '#0D9488', fontWeight: 700, textTransform: 'none' }}
          >
            View Full History ({history.length})
          </Button>
        </Box>

        {history.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#64748B', py: 3, textAlign: 'center' }}>
            No past testing history recorded yet.
          </Typography>
        ) : (
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>REPORT ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>APPLICANT &amp; INSTRUMENT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>ERROR (%)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>SECURITY SEAL</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>LMO ENDORSEMENT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>CERTIFICATE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.slice(0, 5).map((h) => (
                <TableRow key={h.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: COLOR }}>{h.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{h.applicant}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      {h.instrument} · SN: <span style={{ fontFamily: 'monospace' }}>{h.serialNo}</span>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`±${h.errorPct}%`}
                      size="small"
                      sx={{
                        bgcolor: parseFloat(h.errorPct) <= 0.05 ? '#F0FDF4' : '#FEF2F2',
                        color: parseFloat(h.errorPct) <= 0.05 ? '#15803D' : '#B91C1C',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>
                    {h.sealNo}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important' }} />}
                      label={h.endorsementStatus || 'Endorsed by LMO'}
                      size="small"
                      sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VerifiedRoundedIcon />}
                      onClick={() => setViewCertModal(h)}
                      sx={{
                        borderColor: COLOR,
                        color: COLOR,
                        fontWeight: 700,
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#F0FDFA', borderColor: COLOR },
                      }}
                    >
                      View Form D
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* ── RECORD INSPECTION / TEST REPORT MODAL ── */}
      <Dialog
        open={inspectModal.open}
        onClose={() => !inspectModal.submitting && setInspectModal((prev) => ({ ...prev, open: false }))}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLOR }}>
              <ScienceRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Record GATC Laboratory Test</Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Application: <strong>{inspectModal.task?.appNumber}</strong> &nbsp;|&nbsp; Instrument: <strong>{inspectModal.task?.instrumentType}</strong>
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setInspectModal((prev) => ({ ...prev, open: false }))}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleConfirmInspect}>
          <DialogContent dividers sx={{ pt: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 2 }}>
              <TextField
                label="Maximum Permissible Error / Test Error (%)"
                value={inspectModal.testError}
                onChange={(e) => setInspectModal((prev) => ({ ...prev, testError: e.target.value }))}
                required
                fullWidth
                helperText="Statutory limit: usually ±0.05% for Class III"
              />

              <TextField
                label="Environmental Conditions / Temp"
                value={inspectModal.envTemp}
                onChange={(e) => setInspectModal((prev) => ({ ...prev, envTemp: e.target.value }))}
                required
                fullWidth
                helperText="e.g. 23°C, 45% RH (Controlled Lab)"
              />

              <TextField
                label="NABL Working Standards Utilized"
                value={inspectModal.workingStandards}
                onChange={(e) => setInspectModal((prev) => ({ ...prev, workingStandards: e.target.value }))}
                required
                fullWidth
                helperText="Reference standard calibration certificate details"
              />

              <TextField
                label="Tamper-Proof GATC Security Seal No."
                value={inspectModal.securitySealNo}
                onChange={(e) => setInspectModal((prev) => ({ ...prev, securitySealNo: e.target.value }))}
                required
                fullWidth
                helperText="Barcoded physical seal affixed to instrument calibration point"
              />
            </Box>

            <FormControl fullWidth sx={{ mb: 2.5 }}>
              <InputLabel>Verification Result</InputLabel>
              <Select
                value={inspectModal.result}
                label="Verification Result"
                onChange={(e) => setInspectModal((prev) => ({ ...prev, result: e.target.value }))}
              >
                <MenuItem value="Pass">Pass — Conforms to Legal Metrology Standards</MenuItem>
                <MenuItem value="Fail">Fail — Exceeds Maximum Permissible Error</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Standard Test Observations"
              value={inspectModal.testObservations}
              onChange={(e) => setInspectModal((prev) => ({ ...prev, testObservations: e.target.value }))}
              multiline
              rows={2}
              fullWidth
              sx={{ mb: 2.5 }}
              helperText="Observations during repeatability, eccentricity, and hysteresis testing"
            />

            <TextField
              label="Laboratory Recommendations &amp; Officer Notes"
              value={inspectModal.notes}
              onChange={(e) => setInspectModal((prev) => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={2}
              fullWidth
              sx={{ mb: 2.5 }}
            />

            <Box sx={{ p: 2, borderRadius: '12px', border: '1.5px dashed #CBD5E1', bgcolor: '#F8FAFC', textAlign: 'center' }}>
              <UploadFileRoundedIcon sx={{ fontSize: 32, color: COLOR, mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                Attach Official GATC Calibration &amp; Test Certificate (PDF)
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5 }}>
                Optional signed laboratory test report with graphical calibration curves
              </Typography>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                id="gatc-dash-test-file"
                style={{ display: 'none' }}
                onChange={(e) => setInspectModal((prev) => ({ ...prev, file: e.target.files[0] }))}
              />
              <label htmlFor="gatc-dash-test-file">
                <Button variant="outlined" component="span" size="small" sx={{ borderColor: COLOR, color: COLOR }}>
                  {inspectModal.file ? inspectModal.file.name : 'Choose File'}
                </Button>
              </label>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={() => setInspectModal((prev) => ({ ...prev, open: false }))}
              disabled={inspectModal.submitting}
              sx={{ color: '#64748B' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={inspectModal.submitting}
              startIcon={inspectModal.submitting ? <CircularProgress size={16} /> : <CheckCircleRoundedIcon />}
              sx={{
                background: GRADIENT,
                fontWeight: 700,
                px: 3,
                borderRadius: '8px',
              }}
            >
              {inspectModal.submitting ? 'Submitting Report...' : 'Submit GATC Verification Report'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── FORM D STATUTORY CERTIFICATE MODAL ── */}
      {viewCertModal && (
        <Dialog
          open={Boolean(viewCertModal)}
          onClose={() => setViewCertModal(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: '20px' } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <VerifiedRoundedIcon sx={{ color: COLOR, fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Statutory Form D Verification Certificate</Typography>
            </Box>
            <IconButton onClick={() => setViewCertModal(null)}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box
              sx={{
                p: 3,
                border: '2px solid #CBD5E1',
                borderRadius: '12px',
                bgcolor: '#FFFFFF',
                fontFamily: 'serif',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 2, display: 'block', color: '#64748B' }}>
                  GOVERNMENT OF INDIA · DEPARTMENT OF CONSUMER AFFAIRS
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', mt: 0.5 }}>
                  SCHEDULE - XI &nbsp;[See Rule 24]
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0D9488', letterSpacing: 1 }}>
                  CERTIFICATE OF VERIFICATION FOR WEIGHTS AND MEASURES
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: '8px' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Certificate No.</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>{viewCertModal.certNo || 'LM/CERT/2026/GATC-882'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Test Report Reference</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>{viewCertModal.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Date of Verification</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{viewCertModal.date || '2026-09-26'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Verification Valid Until</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803D' }}>{viewCertModal.validUntil || '2027-09-25'}</Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  I hereby certify that I have examined and verified the instrument specified below belonging to <strong>{viewCertModal.applicant}</strong>, which was tested at Government Approved Test Centre under Section 24 of the Legal Metrology Act, 2009.
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, p: 2, border: '1px solid #E2E8F0', borderRadius: '8px', mb: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>Instrument Type</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{viewCertModal.instrument}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>Serial Number</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{viewCertModal.serialNo}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>Observed Calibration Error</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0D9488' }}>±{viewCertModal.errorPct}% (Passed MPE)</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 4, pt: 2, borderTop: '1px dashed #CBD5E1' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Affixed Security Seal</Typography>
                  <Chip label={viewCertModal.sealNo} size="small" sx={{ fontFamily: 'monospace', fontWeight: 800, bgcolor: '#F0FDFA', color: '#0D9488', border: '1px solid #99F6E4' }} />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Verified &amp; Endorsed By</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>Legal Metrology Officer (LMO)</Typography>
                  <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700 }}>Digitally Endorsed Form D</Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setViewCertModal(null)} sx={{ color: '#64748B' }}>Close</Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
              sx={{ bgcolor: COLOR, '&:hover': { bgcolor: '#0F766E' }, fontWeight: 700 }}
            >
              Print Certificate
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
