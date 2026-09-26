import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';

const COLOR = '#B91C1C';
const GRADIENT = 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)';

const roleColor = {
  user: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Citizen / Trader' },
  lmo: { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', label: 'LMO Officer' },
  field_officer: { color: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF', label: 'Field Officer' },
  admin: { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', label: 'System Admin' },
};

const systemHealth = [
  { label: 'API Gateway', status: 'Optimal', uptime: '99.98%', color: '#16A34A' },
  { label: 'Master SQLite / Prisma DB', status: 'Synchronized', uptime: '100%', color: '#16A34A' },
  { label: 'Statutory Audit Stream', status: 'Active', uptime: '99.9%', color: '#16A34A' },
  { label: 'Form D Stamping Vault', status: 'Operational', uptime: '100%', color: '#16A34A' },
];

export default function AdminDashboard({ userEmail }) {
  const navigate = useNavigate();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    pendingReview: 0,
    underInspection: 0,
    certificatesIssued: 0,
    activeLMOs: 0,
    activeFieldOfficers: 0,
    revenueCollected: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/analytics', { credentials: 'include' }),
        fetch('http://localhost:5000/api/admin/users', { credentials: 'include' }),
      ]);

      const analyticsData = await analyticsRes.json();
      const usersData = await usersRes.json();

      if (analyticsData.analytics) setAnalytics(analyticsData.analytics);
      if (usersData.users) setUsers(usersData.users);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const statCards = [
    {
      label: 'Total Registered Users',
      value: users.length,
      change: 'Active Registry',
      icon: PeopleAltRoundedIcon,
      color: '#0284C7',
      bg: '#EFF6FF',
      border: '#BFDBFE',
    },
    {
      label: 'Certificates Issued',
      value: analytics.certificatesIssued,
      change: '100% Verified',
      icon: VerifiedUserRoundedIcon,
      color: '#16A34A',
      bg: '#F0FDF4',
      border: '#BBF7D0',
    },
    {
      label: 'Pending & Inspecting Apps',
      value: analytics.pendingReview + analytics.underInspection,
      change: `${analytics.pendingReview} Pending / ${analytics.underInspection} Active`,
      icon: TrendingUpRoundedIcon,
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
    },
    {
      label: 'Revenue Settled (Fees)',
      value: `₹${analytics.revenueCollected}`,
      change: 'BharatKosh Gateway',
      icon: StorageRoundedIcon,
      color: '#7E22CE',
      bg: '#FAF5FF',
      border: '#E9D5FF',
    },
  ];

  return (
    <Box sx={{ pb: 4 }}>
      {/* ── Top Header Banner ── */}
      <Box
        sx={{
          mb: 3,
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
              label="CENTRAL ADMINISTRATION"
              size="small"
              sx={{
                bgcolor: '#FEF2F2',
                color: '#B91C1C',
                border: '1px solid #FECACA',
                fontWeight: 800,
                fontSize: '0.68rem',
                borderRadius: '6px',
              }}
            />
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              State Directorate of Legal Metrology
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
            Director General Control Center
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Super Administrator: <strong style={{ color: '#0F172A' }}>{userEmail || 'admin@example.com'}</strong>
          </Typography>
        </Box>

        {/* Action Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={fetchAdminData}
            sx={{ borderColor: '#E2E8F0', color: '#475569', fontWeight: 700 }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<GavelRoundedIcon />}
            onClick={() => navigate('/dashboard/admin/users')}
            sx={{ background: GRADIENT, borderRadius: '12px', fontWeight: 700, px: 2.5 }}
          >
            Clearances &amp; Commissioning
          </Button>

          <Box
            sx={{
              bgcolor: maintenanceMode ? '#FEF2F2' : '#F8FAFC',
              border: `1.5px solid ${maintenanceMode ? '#FECACA' : '#E2E8F0'}`,
              borderRadius: '12px',
              px: 2,
              py: 0.75,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  color="error"
                  size="small"
                />
              }
              label={
                <Typography variant="caption" sx={{ fontWeight: 800, color: maintenanceMode ? '#B91C1C' : '#475569' }}>
                  {maintenanceMode ? 'PLATFORM LOCKED' : 'MAINTENANCE'}
                </Typography>
              }
              sx={{ m: 0 }}
            />
          </Box>
        </Box>
      </Box>

      {/* ── Government Identity & Credential Hierarchy Quick Action Banner ── */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 2.5,
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #0F2B4E 0%, #1E3A8A 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          boxShadow: '0 8px 24px -4px rgba(15, 43, 78, 0.25)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '14px' }}>
            <KeyRoundedIcon sx={{ fontSize: 32, color: '#F59E0B' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              Multi-Tier Government Identity &amp; Credential Hierarchy
            </Typography>
            <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.88rem' }}>
              Super Administrator commissions District LMOs (with Class-3 DSC) and clears Field Inspector security dossiers.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard/admin/users')}
          sx={{
            bgcolor: '#F59E0B',
            color: '#0F172A',
            fontWeight: 800,
            borderRadius: '10px',
            textTransform: 'none',
            px: 2.5,
            '&:hover': { bgcolor: '#D97706' },
          }}
        >
          Review Clearances &amp; Commission LMO
        </Button>
      </Paper>

      {maintenanceMode && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3.5,
            borderRadius: '16px',
            bgcolor: '#FEF2F2',
            border: '1.5px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            gap: 1.75,
          }}
        >
          <WarningAmberRoundedIcon sx={{ color: '#B91C1C', fontSize: 28 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#991B1B', fontWeight: 800 }}>
              Statutory Platform Lock Active
            </Typography>
            <Typography variant="body2" sx={{ color: '#B91C1C', fontSize: '0.86rem' }}>
              Maintenance mode is currently enabled.
            </Typography>
          </Box>
        </Paper>
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
              sx={{
                p: 3,
                borderRadius: '18px',
                border: '1.5px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
                <Chip
                  label={s.change}
                  size="small"
                  sx={{
                    bgcolor: '#F8FAFC',
                    color: '#475569',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                  }}
                />
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  color: '#0F172A',
                  fontSize: '2rem',
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

      {/* ── Main Split Section: Users Table & System Health ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2.3fr 1fr' },
          gap: 3.5,
        }}
      >
        {/* User Management Card */}
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
              flexWrap: 'wrap',
              gap: 2,
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: '#FEF2F2',
                  color: '#B91C1C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PeopleAltRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
                  Live System User Registry
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Statutory accounts in the central database ({users.length} enrolled)
                </Typography>
              </Box>
            </Box>

            <Button
              size="small"
              onClick={() => navigate('/dashboard/admin/users')}
              sx={{ color: COLOR, fontWeight: 700 }}
            >
              Manage Users →
            </Button>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['USER / OFFICIAL', 'ASSIGNED ROLE', 'VERIFICATION', 'JOINED DATE', 'STATUS'].map((h) => (
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
                {users.slice(0, 5).map((u) => (
                  <TableRow
                    key={u.email}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: roleColor[u.role]?.bg || '#F1F5F9',
                            color: roleColor[u.role]?.color || '#0F172A',
                            border: `1px solid ${roleColor[u.role]?.border || '#E2E8F0'}`,
                            fontSize: '0.85rem',
                            fontWeight: 800,
                          }}
                        >
                          {u.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {u.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                            {u.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={roleColor[u.role]?.label || u.role}
                        size="small"
                        sx={{
                          bgcolor: roleColor[u.role]?.bg,
                          color: roleColor[u.role]?.color,
                          border: `1px solid ${roleColor[u.role]?.border}`,
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {u.verified ? (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, color: '#16A34A', fontSize: '0.8rem', fontWeight: 600 }}>
                          <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> Verified
                        </Box>
                      ) : (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>
                          <BlockRoundedIcon sx={{ fontSize: 16 }} /> Pending
                        </Box>
                      )}
                    </TableCell>

                    <TableCell sx={{ color: '#64748B', fontSize: '0.82rem', fontWeight: 500 }}>
                      {u.joined}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={u.status}
                        size="small"
                        sx={{
                          bgcolor: u.status === 'ACTIVE' ? '#F0FDF4' : '#FFFBEB',
                          color: u.status === 'ACTIVE' ? '#15803D' : '#B45309',
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>

        {/* System Health */}
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
          <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
              Infrastructure Nodes
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Statutory uptime &amp; database cluster health
            </Typography>
          </Box>

          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {systemHealth.map((node) => (
              <Box
                key={node.label}
                sx={{
                  p: 2,
                  borderRadius: '14px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {node.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Uptime: {node.uptime}
                  </Typography>
                </Box>
                <Chip
                  label={node.status}
                  size="small"
                  sx={{
                    bgcolor: '#F0FDF4',
                    color: node.color,
                    border: '1px solid #BBF7D0',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    borderRadius: '6px',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
