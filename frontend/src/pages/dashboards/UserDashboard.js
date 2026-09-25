import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from 'react-router-dom';

const COLOR = '#D97706';
const GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';

const statusColor = {
  Approved: { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  Pending: { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  'Under Inspection': { color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  Rejected: { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
};

function StatCard({ label, value, icon, color, bg, border, loading }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '18px',
        border: '1.5px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        height: '100%',
        boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
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
            bgcolor: bg,
            border: `1px solid ${border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {icon}
        </Box>
        {loading ? (
          <CircularProgress size={24} sx={{ color }} />
        ) : (
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '2rem', letterSpacing: '-0.02em' }}>
            {value}
          </Typography>
        )}
      </Box>
      <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.88rem' }}>
        {label}
      </Typography>
    </Paper>
  );
}

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function UserDashboard({ userEmail }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, certificates: 0 });
  const [applications, setApplications] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/dashboard-stats', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.stats) setStats(d.stats);
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false));

    fetch('http://localhost:5000/api/auth/applications', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.applications) setApplications(d.applications.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoadingApps(false));
  }, []);

  const statCards = [
    { label: 'Total Applications', value: stats.total, icon: <AssignmentRoundedIcon sx={{ fontSize: 24 }} />, color: '#0284C7', bg: '#EFF6FF', border: '#BFDBFE' },
    { label: 'Approved Applications', value: stats.approved, icon: <CheckCircleRoundedIcon sx={{ fontSize: 24 }} />, color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
    { label: 'Pending Verification', value: stats.pending, icon: <HourglassEmptyRoundedIcon sx={{ fontSize: 24 }} />, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
    { label: 'Digital Certificates', value: stats.certificates, icon: <DownloadRoundedIcon sx={{ fontSize: 24 }} />, color: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF' },
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Chip
              label="CITIZEN & COMMERCIAL TRADER PORTAL"
              size="small"
              sx={{
                bgcolor: '#FFFBEB',
                color: '#B45309',
                border: '1px solid #FDE68A',
                fontWeight: 800,
                fontSize: '0.68rem',
                borderRadius: '6px',
              }}
            />
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              National Legal Metrology Single Window
            </Typography>
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
            My Instruments &amp; Applications
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Enrolled User: <strong style={{ color: '#0F172A' }}>{userEmail || 'user@example.com'}</strong>
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddCircleRoundedIcon />}
          onClick={() => navigate('/dashboard/user/apply')}
          sx={{
            background: GRADIENT,
            color: '#FFFFFF',
            borderRadius: '12px',
            fontWeight: 700,
            px: 3,
            py: 1.4,
            fontSize: '0.92rem',
            textTransform: 'none',
            boxShadow: '0 6px 20px rgba(217, 119, 6, 0.25)',
            '&:hover': {
              background: GRADIENT,
              filter: 'brightness(0.95)',
            },
          }}
        >
          New Verification Application
        </Button>
      </Box>

      {/* Advisory Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3.5,
          borderRadius: '14px',
          bgcolor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <InfoOutlinedIcon sx={{ color: '#0284C7', fontSize: 22 }} />
        <Typography variant="body2" sx={{ color: '#1E40AF', fontSize: '0.86rem', fontWeight: 600 }}>
          Statutory Reminder: Periodic re-stamping for all commercial weighing balances must be renewed prior to certificate expiration under Section 24 of the Legal Metrology Act, 2009.
        </Typography>
      </Paper>

      {/* ── 4 KPI Stats Grid ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 4,
        }}
      >
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} loading={loadingStats} />
        ))}
      </Box>

      {/* ── Recent Applications Table ── */}
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
                bgcolor: '#FFFBEB',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AssignmentRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
                Recent Verification Applications
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Latest filings submitted for legal metrology inspection
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '1rem !important' }} />}
            onClick={() => navigate('/dashboard/user/applications')}
            sx={{
              color: '#B45309',
              fontWeight: 700,
              fontSize: '0.84rem',
              textTransform: 'none',
              '&:hover': { bgcolor: '#FFFBEB' },
            }}
          >
            View All Applications
          </Button>
        </Box>

        {loadingApps ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: COLOR }} />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['APPLICATION ID', 'INSTRUMENT CATEGORY', 'SUBMISSION DATE', 'CURRENT STATUS', 'ACTION'].map((h) => (
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
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 7 }}>
                      <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 600, mb: 1 }}>
                        No verification applications found.
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/dashboard/user/apply')}
                        sx={{
                          borderColor: '#D97706',
                          color: '#B45309',
                          fontWeight: 700,
                          borderRadius: '8px',
                          textTransform: 'none',
                        }}
                      >
                        Register Your First Instrument
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow
                      key={app.id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <TableCell sx={{ fontWeight: 800, color: '#B45309', fontSize: '0.85rem' }}>
                        {app.app_number}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>
                        {app.instrument_type}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 500 }}>
                        {formatDate(app.submitted_at)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={app.status}
                          size="small"
                          sx={{
                            bgcolor: statusColor[app.status]?.bg || '#F1F5F9',
                            color: statusColor[app.status]?.color || '#475569',
                            border: `1px solid ${statusColor[app.status]?.border || '#E2E8F0'}`,
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {app.status === 'Approved' ? (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DownloadRoundedIcon sx={{ fontSize: 16 }} />}
                            onClick={() => navigate('/dashboard/user/certificates')}
                            sx={{
                              color: '#15803D',
                              borderColor: '#BBF7D0',
                              bgcolor: '#F0FDF4',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              borderRadius: '8px',
                              textTransform: 'none',
                              '&:hover': { bgcolor: '#DCFCE7' },
                            }}
                          >
                            Certificate
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            onClick={() => navigate('/dashboard/user/applications')}
                            sx={{
                              color: '#64748B',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              textTransform: 'none',
                            }}
                          >
                            View Details
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
