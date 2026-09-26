import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import { useNavigate } from 'react-router-dom';

const COLOR = '#7E22CE';
const GRADIENT = 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)';

export default function FieldOfficerDashboard({ userEmail }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    todayAssigned: 0,
    completedMonthly: 0,
    targetMonthly: 20,
    progress: 0,
    totalCompleted: 0,
    activeCircle: 'Jurisdiction Circle',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Inspection modal state
  const [inspectModal, setInspectModal] = useState({
    open: false,
    task: null,
    testError: '0.02',
    envTemp: '25°C, 50% RH',
    securitySealNo: `SEAL-DL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    result: 'Pass',
    notes: 'All load points verified against NPL working standards. Sealed and stamped under Rule 11.',
    submitting: false,
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/field-officer/tasks', { credentials: 'include' }),
        fetch('http://localhost:5000/api/field-officer/stats', { credentials: 'include' }),
      ]);

      const tasksData = await tasksRes.json();
      const statsData = await statsRes.json();

      if (tasksData.tasks) setTasks(tasksData.tasks);
      if (statsData.stats) setStats(statsData.stats);
    } catch (err) {
      setError('Unable to load inspection roster from server.');
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
      testError: '0.02',
      envTemp: '25°C, 50% RH',
      securitySealNo: `SEAL-DL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      result: 'Pass',
      notes: `Verified against working standards. MPE is within permissible limits for ${task.instrument}. Affixed official lead/polycarbonate seal.`,
      submitting: false,
    });
  };

  const handleConfirmInspect = async (e) => {
    e.preventDefault();
    if (!inspectModal.task) return;

    setInspectModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/field-officer/applications/${inspectModal.task.id}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          test_error_percentage: inspectModal.testError,
          environmental_temp: inspectModal.envTemp,
          security_seal_no: inspectModal.securitySealNo,
          inspection_result: inspectModal.result,
          inspection_notes: inspectModal.notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Inspection submitted! ${inspectModal.result === 'Pass' ? 'Findings and seal details forwarded to LMO for statutory verification and certificate issuance.' : 'Rejection notice issued.'}`);
        setInspectModal({ open: false, task: null, testError: '', envTemp: '', securitySealNo: '', result: 'Pass', notes: '', submitting: false });
        fetchData();
      } else {
        setError(data.error || 'Failed to complete inspection.');
      }
    } catch (err) {
      setError('Server communication failure.');
    } finally {
      setInspectModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const statCards = [
    {
      label: "Today's Scheduled Tasks",
      value: tasks.length,
      detail: 'On-ground field inspections',
      icon: TodayRoundedIcon,
      color: '#7E22CE',
      bg: '#FAF5FF',
      border: '#E9D5FF',
    },
    {
      label: 'Verified & Stamped',
      value: stats.totalCompleted,
      detail: 'Official Certificates active',
      icon: CheckCircleRoundedIcon,
      color: '#16A34A',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      path: '/dashboard/field-officer/history',
    },
    {
      label: 'Current Month Total',
      value: `${stats.completedMonthly} / ${stats.targetMonthly}`,
      detail: 'Statutory compliance quota',
      icon: FactCheckRoundedIcon,
      color: '#0284C7',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      path: '/dashboard/field-officer/history',
    },
    {
      label: 'Geofence Radius Lock',
      value: 'ACTIVE',
      detail: stats.activeCircle,
      icon: LocationOnRoundedIcon,
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
    },
  ];

  return (
    <Box sx={{ pb: 4 }}>
      {/* ── Top Header Banner ── */}
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
              label="ON-GROUND INSPECTION STAFF"
              size="small"
              sx={{
                bgcolor: '#FAF5FF',
                color: '#6B21A8',
                border: '1px solid #E9D5FF',
                fontWeight: 800,
                fontSize: '0.68rem',
                borderRadius: '6px',
              }}
            />
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important' }} />}
              label="GEOFENCE UNLOCKED: KAROL BAGH CIRCLE"
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
            sx={{
              fontWeight: 900,
              color: '#0F172A',
              fontSize: { xs: '1.5rem', sm: '1.9rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Field Inspector Operations
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Field Officer: <strong style={{ color: '#0F172A' }}>{userEmail || 'Active Inspector'}</strong> &nbsp;|&nbsp; Operating Circle: <strong>{stats.activeCircle}</strong> &nbsp;|&nbsp; Statutory Field Verification
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
            startIcon={<UploadFileRoundedIcon />}
            onClick={() => navigate('/dashboard/field-officer/report')}
            sx={{
              background: GRADIENT,
              color: '#FFFFFF',
              borderRadius: '12px',
              fontWeight: 700,
              px: 3,
              boxShadow: '0 6px 20px rgba(126, 34, 206, 0.25)',
            }}
          >
            Submit Report Dossier
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* ── 4 KPI Stats Grid ── */}
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
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: s.path ? 'translateY(-3px)' : 'none',
                  boxShadow: s.path ? '0 12px 24px -6px rgba(15, 23, 42, 0.08)' : '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
                  borderColor: s.path ? s.color : '#E2E8F0',
                },
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

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  color: '#0F172A',
                  fontSize: '2.1rem',
                  lineHeight: 1.1,
                  mb: 0.5,
                  letterSpacing: '-0.02em',
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: s.color }} /> : s.value}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.88rem' }}>
                {s.label}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* ── Monthly Progress Banner ── */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: '18px',
          border: '1.5px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Monthly Verification Quota &amp; SLA Target
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Statutory inspections assigned for current calendar month
            </Typography>
          </Box>
          <Typography variant="subtitle2" sx={{ color: COLOR, fontWeight: 800 }}>
            {stats.completedMonthly} / {stats.targetMonthly} Completed ({stats.progress}%)
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={stats.progress}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: '#FAF5FF',
            '& .MuiLinearProgress-bar': {
              background: GRADIENT,
              borderRadius: 5,
            },
          }}
        />
      </Paper>

      {/* ── Today's Assigned Schedule Roster ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          overflow: 'hidden',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: '#FAF5FF',
                color: '#7E22CE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TodayRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
                Assigned Field Verification Roster
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Dispatched inspections waiting for physical testing and stamping
              </Typography>
            </Box>
          </Box>

          <Chip
            label={`${tasks.length} Pending Inspection`}
            size="small"
            sx={{
              bgcolor: '#FAF5FF',
              color: '#6B21A8',
              border: '1px solid #E9D5FF',
              fontWeight: 800,
              fontSize: '0.72rem',
            }}
          />
        </Box>

        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: COLOR }} />
            </Box>
          ) : tasks.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 50, color: '#16A34A', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                All Assigned Inspections Completed!
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 440, mx: 'auto', mt: 0.5 }}>
                No pending inspections in your queue. When the LMO assigns new applications, they will appear here in real-time.
              </Typography>
            </Box>
          ) : (
            tasks.map((task) => (
              <Box
                key={task.id}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: '#FAF5FF',
                  border: '1.5px solid #D8B4FE',
                  boxShadow: '0 4px 14px rgba(126, 34, 206, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 280 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip
                      label={task.appNumber}
                      size="small"
                      sx={{ bgcolor: '#7E22CE', color: '#FFFFFF', fontWeight: 800, fontSize: '0.72rem' }}
                    />
                    <Chip
                      label={task.priority}
                      size="small"
                      sx={{
                        bgcolor: task.priority === 'High' ? '#FFEBEE' : '#EFF6FF',
                        color: task.priority === 'High' ? '#B71C1C' : '#1D4ED8',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                      <AccessTimeRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                      <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700 }}>
                        {task.date} · {task.time}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
                    {task.applicant}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                    {task.instrument} &nbsp;|&nbsp; S/N: <span style={{ fontFamily: 'monospace' }}>{task.serial}</span> ({task.make})
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <LocationOnRoundedIcon sx={{ fontSize: 16, color: '#15803D' }} />
                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
                      {task.address} &nbsp;·&nbsp; 📞 {task.contact}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    startIcon={<VerifiedRoundedIcon />}
                    onClick={() => handleOpenInspect(task)}
                    sx={{
                      background: GRADIENT,
                      fontWeight: 700,
                      borderRadius: '10px',
                      px: 2.5,
                      py: 1,
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(126, 34, 206, 0.25)',
                    }}
                  >
                    Conduct Inspection &amp; Stamp
                  </Button>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Paper>

      {/* ── CONDUCT INSPECTION & STAMPING MODAL ── */}
      <Dialog
        open={inspectModal.open}
        onClose={() => !inspectModal.submitting && setInspectModal({ ...inspectModal, open: false })}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <Box component="form" onSubmit={handleConfirmInspect}>
          <DialogTitle sx={{ fontWeight: 800, color: '#6B21A8', display: 'flex', alignItems: 'center', gap: 1 }}>
            <VerifiedRoundedIcon />
            Physical Verification &amp; Stamping — {inspectModal.task?.appNumber}
          </DialogTitle>
          <Divider />

          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#FAF5FF', borderColor: '#E9D5FF', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#6B21A8', fontWeight: 800, display: 'block' }}>
                PREMISES &amp; INSTRUMENT UNDER TEST
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
                {inspectModal.task?.applicant}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569' }}>
                Instrument: <strong>{inspectModal.task?.instrument}</strong> &nbsp;|&nbsp; Serial No: <strong>{inspectModal.task?.serial}</strong> &nbsp;|&nbsp; Accuracy Class: <strong>{inspectModal.task?.accuracyClass}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                📍 {inspectModal.task?.address}
              </Typography>
            </Paper>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tested Error Margin (%) *"
                  value={inspectModal.testError}
                  onChange={(e) => setInspectModal({ ...inspectModal, testError: e.target.value })}
                  helperText="Maximum Permissible Error (MPE) <= 0.1%"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Environmental Conditions *"
                  value={inspectModal.envTemp}
                  onChange={(e) => setInspectModal({ ...inspectModal, envTemp: e.target.value })}
                  placeholder="e.g. 25°C, 50% RH"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Inspection Result *</InputLabel>
                  <Select
                    value={inspectModal.result}
                    label="Inspection Result *"
                    onChange={(e) => setInspectModal({ ...inspectModal, result: e.target.value })}
                  >
                    <MenuItem value="Pass">✅ Pass — Issue Certificate</MenuItem>
                    <MenuItem value="Conditional">⚠️ Conditional Pass</MenuItem>
                    <MenuItem value="Fail">❌ Fail — Issue Notice</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {inspectModal.result !== 'Fail' && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F0FDF4', borderColor: '#BBF7D0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SecurityRoundedIcon sx={{ color: '#15803D' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#15803D' }}>
                    Affix Physical Lead / Polycarbonate Security Seal
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  label="Affixed Security Seal Barcode / Serial No *"
                  value={inspectModal.securitySealNo}
                  onChange={(e) => setInspectModal({ ...inspectModal, securitySealNo: e.target.value })}
                  helperText="Unique tamper-proof seal crimped onto the instrument calibration screws."
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', fontFamily: 'monospace' } }}
                />
              </Paper>
            )}

            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Inspector Statutory Findings &amp; Endorsement *"
              value={inspectModal.notes}
              onChange={(e) => setInspectModal({ ...inspectModal, notes: e.target.value })}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button
              onClick={() => setInspectModal({ ...inspectModal, open: false })}
              disabled={inspectModal.submitting}
              sx={{ color: '#64748B' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={inspectModal.submitting}
              sx={{
                background:
                  inspectModal.result === 'Fail'
                    ? '#B91C1C'
                    : 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                fontWeight: 700,
                px: 3,
              }}
            >
              {inspectModal.submitting
                ? 'Submitting Report...'
                : inspectModal.result === 'Fail'
                ? 'Issue Rejection Notice'
                : 'Affix Seal & Forward Report to LMO'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
