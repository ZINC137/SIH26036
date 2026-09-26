import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { useNavigate } from 'react-router-dom';

const COLOR = '#15803D';
const GRADIENT = 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)';

const priorityColor = {
  High: { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
  Normal: { color: '#0284C7', bg: '#EFF6FF', border: '#BFDBFE' },
  Low: { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
};

const statusColor = {
  Pending: { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  'Under Inspection': { color: '#0284C7', bg: '#EFF6FF', border: '#BFDBFE' },
  'Inspection Reported': { color: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF' },
  Approved: { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  Rejected: { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
};

export default function LMODashboard({ userEmail }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pending: 0,
    underInspection: 0,
    inspectionReported: 0,
    approved: 0,
    rejected: 0,
    officers: 0,
    total: 0,
  });
  const [applications, setApplications] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes, officersRes] = await Promise.all([
        fetch('http://localhost:5000/api/lmo/stats', { credentials: 'include' }),
        fetch('http://localhost:5000/api/lmo/applications', { credentials: 'include' }),
        fetch('http://localhost:5000/api/lmo/officers', { credentials: 'include' }),
      ]);

      const statsData = await statsRes.json();
      const appsData = await appsRes.json();
      const officersData = await officersRes.json();

      if (statsData.stats) setStats(statsData.stats);
      if (appsData.applications) setApplications(appsData.applications);
      if (officersData.officers) setOfficers(officersData.officers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/lmo/applications/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action,
          notes: action === 'approve'
            ? 'FO inspection report reviewed and verified. Certificate issued under Section 24 of Legal Metrology Act.'
            : 'Rejected after territorial scrutiny.',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(action === 'approve'
          ? `Certificate issued! ${data.message}`
          : 'Application rejected.');
        fetchDashboardData();
      } else {
        setFeedback(data.error || 'Action failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statCards = [
    {
      label: 'Pending Review Queue',
      value: stats.pending,
      detail: 'Requires statutory scrutiny',
      icon: PendingActionsRoundedIcon,
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
      path: '/dashboard/lmo/pending',
    },
    {
      label: 'Awaiting LMO Signature',
      value: stats.inspectionReported,
      detail: 'FO reports pending your DSC sign',
      icon: AssignmentTurnedInRoundedIcon,
      color: '#7E22CE',
      bg: '#FAF5FF',
      border: '#E9D5FF',
      path: '/dashboard/lmo/pending',
    },
    {
      label: 'Certificates Issued',
      value: stats.approved,
      detail: 'Passed & LMO signed',
      icon: VerifiedUserRoundedIcon,
      color: '#16A34A',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      path: '/dashboard/lmo/certificates',
    },
    {
      label: 'Field Inspections Active',
      value: stats.underInspection,
      detail: 'Dispatched to officers',
      icon: GroupRoundedIcon,
      color: '#0284C7',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      path: '/dashboard/lmo/pending',
    },
    {
      label: 'Officers In Jurisdiction',
      value: officers.length,
      detail: 'Delhi North Zone Staff',
      icon: HowToRegRoundedIcon,
      color: '#15803D',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      path: '/dashboard/lmo/officers',
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
              label="LEGAL METROLOGY OFFICIAL PORTAL"
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
            <Chip
              label="DSC: DSC-DL-2026-SHA256 [CLASS-3 ACTIVE]"
              size="small"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
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
            District Metrology Directorate
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Officer-in-Charge: <strong style={{ color: '#0F172A' }}>{userEmail || 'rajesh@example.com'}</strong> &nbsp;|&nbsp; Jurisdiction: <strong>Delhi North Division</strong> &nbsp;|&nbsp; Gazette: <strong>GOV/NOTIF/2026/89</strong>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={fetchDashboardData}
            sx={{ borderColor: '#E2E8F0', color: '#475569', fontWeight: 700 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AssignmentIndIcon />}
            onClick={() => navigate('/dashboard/lmo/pending')}
            sx={{
              background: GRADIENT,
              color: '#FFFFFF',
              borderRadius: '12px',
              fontWeight: 700,
              px: 3,
              boxShadow: '0 6px 20px rgba(22, 163, 74, 0.25)',
            }}
          >
            Manage Applications Queue
          </Button>
        </Box>
      </Box>

      {feedback && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setFeedback('')}>
          {feedback}
        </Alert>
      )}

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
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 24px -6px rgba(15, 23, 42, 0.08)',
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

      {/* ── Main Split Section: Pending Queue & Field Officers ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2.3fr 1fr' },
          gap: 3.5,
        }}
      >
        {/* Pending Applications Queue */}
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
                  bgcolor: '#F0FDF4',
                  color: '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PendingActionsRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
                  Statutory Application Queue
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Real-time applications requiring territorial verification
                </Typography>
              </Box>
            </Box>

            <Button
              size="small"
              onClick={() => navigate('/dashboard/lmo/pending')}
              sx={{ color: COLOR, fontWeight: 700, fontSize: '0.78rem' }}
            >
              View All ({applications.length}) →
            </Button>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['APP ID', 'APPLICANT / FIRM', 'INSTRUMENT DETAILS', 'PRIORITY', 'STATUS', 'ACTION'].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        color: '#475569',
                        letterSpacing: '0.04em',
                        py: 1.5,
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.slice(0, 5).map((app) => (
                  <TableRow key={app.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      {app.appNumber}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>
                        {app.applicant}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Submitted {app.submitted}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, fontSize: '0.82rem' }}>
                        {app.instrument}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        S/N: {app.serial}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={app.priority}
                        size="small"
                        sx={{
                          bgcolor: priorityColor[app.priority]?.bg,
                          color: priorityColor[app.priority]?.color,
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={app.status}
                        size="small"
                        sx={{
                          bgcolor: statusColor[app.status]?.bg || '#F8FAFC',
                          color: statusColor[app.status]?.color || '#475569',
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {app.status === 'Pending' ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate('/dashboard/lmo/pending')}
                            sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#7E22CE', borderColor: '#D8B4FE' }}
                          >
                            Assign FO
                          </Button>
                          <Tooltip title="Direct Stamping Clearance">
                            <IconButton
                              size="small"
                              onClick={() => handleAction(app.id, 'approve')}
                              sx={{
                                color: '#16A34A',
                                bgcolor: '#F0FDF4',
                                border: '1px solid #BBF7D0',
                                borderRadius: '8px',
                                p: 0.7,
                                '&:hover': { bgcolor: '#DCFCE7' },
                              }}
                            >
                              <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                          {app.assignedFoName ? `Assigned (${app.assignedFoName.split(' ')[1] || 'FO'})` : 'Completed'}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {applications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#9E9E9E' }}>
                      No pending applications in your jurisdiction.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Paper>

        {/* Field Officers Roster */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <GroupRoundedIcon sx={{ color: COLOR, fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                Field Inspectors
              </Typography>
            </Box>
            <Chip
              label={`${officers.filter((o) => o.status === 'Active').length} Active`}
              size="small"
              sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 700, fontSize: '0.68rem' }}
            />
          </Box>

          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {officers.length === 0 ? (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, mb: 0.5 }}>
                  No field inspectors registered yet.
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  Nominate inspectors to assign field inspection tasks.
                </Typography>
              </Box>
            ) : (
              officers.map((o) => (
                <Box
                  key={o.id}
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                  }}
                >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: '#EFF6FF',
                        color: '#1D4ED8',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                      }}
                    >
                      {o.name.split(' ').map((n) => n[0]).join('')}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem' }}>
                        {o.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>
                        {o.id} · {o.zone}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={o.status}
                    size="small"
                    sx={{
                      bgcolor: o.status === 'Active' ? '#F0FDF4' : '#FFFBEB',
                      color: o.status === 'Active' ? '#15803D' : '#B45309',
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      height: 20,
                    }}
                  />
                </Box>
              </Box>
            )))}
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/dashboard/lmo/officers')}
              sx={{ mt: 1, borderColor: '#CBD5E1', color: '#475569', fontWeight: 700 }}
            >
              Nominate &amp; View All Officers
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* ── Recently Issued Certificates & Stamping Records ── */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
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
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: '#F0FDF4',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <VerifiedUserRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                Recently Issued Stamping Certificates
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Form D certificates signed with Class-3 DSC in North Delhi jurisdiction
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            onClick={() => navigate('/dashboard/lmo/certificates')}
            sx={{ color: '#15803D', fontWeight: 700, fontSize: '0.78rem' }}
          >
            Open Certificate Registry →
          </Button>
        </Box>

        {applications.filter((a) => a.status === 'Approved' && a.certificateNo).length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
              No certificates issued yet in this session.
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>
              Review reported inspections in the Pending Queue to issue and sign Form D certificates.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['CERTIFICATE NO', 'APPLICANT FIRM', 'INSTRUMENT', 'INSPECTING FO', 'LEAD SEAL', 'STATUS'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.72rem', color: '#475569', py: 1.5 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {applications
                  .filter((a) => a.status === 'Approved' && a.certificateNo)
                  .slice(0, 5)
                  .map((app) => (
                    <TableRow key={app.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 800, color: '#15803D', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                        {app.certificateNo}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
                        {app.applicant}
                      </TableCell>
                      <TableCell sx={{ color: '#334155', fontSize: '0.82rem' }}>
                        {app.instrument}
                      </TableCell>
                      <TableCell sx={{ color: '#475569', fontSize: '0.82rem' }}>
                        {app.assignedFoName || 'Field Inspector'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: '#F8FAFC', px: 1, py: 0.4, borderRadius: '4px', border: '1px solid #E2E8F0', fontWeight: 700 }}>
                          {app.securitySealNo || 'SEAL-DL-ACTIVE'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Valid Certificate"
                          size="small"
                          sx={{ bgcolor: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', fontWeight: 800, fontSize: '0.65rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
