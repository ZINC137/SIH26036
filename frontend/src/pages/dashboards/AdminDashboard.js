import React, { useState } from 'react';
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
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';


const COLOR = '#B91C1C';
const GRADIENT = 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)';

const stats = [
  {
    label: 'Total Users',
    value: '1,284',
    change: '+14% this month',
    icon: PeopleAltRoundedIcon,
    color: '#0284C7',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  {
    label: 'Certificates Issued',
    value: '9,471',
    change: '99.8% verified',
    icon: VerifiedUserRoundedIcon,
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0',
  },
  {
    label: 'Applications Today',
    value: '143',
    change: '+22 vs yesterday',
    icon: TrendingUpRoundedIcon,
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
  {
    label: 'Master DB Size',
    value: '2.4 GB',
    change: 'Encrypted SHA-256',
    icon: StorageRoundedIcon,
    color: '#7E22CE',
    bg: '#FAF5FF',
    border: '#E9D5FF',
  },
];

const users = [
  { name: 'Priya Sharma', email: 'priya@example.com', role: 'user', verified: true, joined: '10 Sep 2026', status: 'Active' },
  { name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'lmo', verified: true, joined: '05 Sep 2026', status: 'Active' },
  { name: 'Anjali Singh', email: 'anjali@example.com', role: 'field_officer', verified: true, joined: '01 Sep 2026', status: 'Active' },
  { name: 'Mohit Gupta', email: 'mohit@example.com', role: 'user', verified: false, joined: '20 Aug 2026', status: 'Unverified' },
  { name: 'Sunita Patel', email: 'sunita@example.com', role: 'user', verified: true, joined: '18 Aug 2026', status: 'Suspended' },
];

const roleColor = {
  user: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Citizen / User' },
  lmo: { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', label: 'LMO Officer' },
  field_officer: { color: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF', label: 'Field Officer' },
  admin: { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', label: 'System Admin' },
};

const systemHealth = [
  { label: 'API Gateway', status: 'Optimal', uptime: '99.97%', color: '#16A34A' },
  { label: 'Master PostgreSQL DB', status: 'Synchronized', uptime: '100%', color: '#16A34A' },
  { label: 'Gov Email Dispatcher', status: 'Active', uptime: '99.5%', color: '#16A34A' },
  { label: 'Encrypted Certificate Vault', status: 'Syncing', uptime: '98.2%', color: '#D97706' },
];

export default function AdminDashboard({ userEmail }) {
  const navigate = useNavigate();
  const [maintenanceMode, setMaintenanceMode] = useState(false);

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
              National Legal Metrology Control Node
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
            System &amp; Infrastructure Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Authenticated Super Administrator: <strong style={{ color: '#0F172A' }}>{userEmail || 'admin@example.com'}</strong>
          </Typography>
        </Box>

        {/* Maintenance Mode & Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<GavelRoundedIcon />}
            onClick={() => navigate('/dashboard/admin/users')}
            sx={{ background: GRADIENT, borderRadius: '12px', fontWeight: 700, px: 2.5 }}
          >
            Provisioning &amp; Clearances
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
                  sx={{
                    '& .MuiSwitch-thumb': { bgcolor: maintenanceMode ? COLOR : '#94A3B8' },
                    '& .MuiSwitch-track': { bgcolor: maintenanceMode ? '#FECACA !important' : '#CBD5E1 !important' },
                  }}
                />
              }
              label={
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: maintenanceMode ? '#B91C1C' : '#475569',
                    fontSize: '0.86rem',
                  }}
                >
                  Maintenance Mode
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
              Multi-Tier Government Identity &amp; Credential Provisioning Hierarchy
            </Typography>
            <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.88rem' }}>
              Super Administrator commissions District LMOs (with Class-3 DSC) and clears Field Inspector security dossiers.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
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
        </Box>
      </Paper>


      {/* Maintenance Mode Active Notice */}
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
              Maintenance mode is currently enabled. Public users, applicant filings, and non-admin queries are temporarily throttled.
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
        {stats.map((s) => {
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
                {s.value}
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
                  User Management Registry
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Statutory accounts across Citizen, Inspector &amp; Official roles
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<PersonAddRoundedIcon />}
                sx={{
                  background: GRADIENT,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  borderRadius: '10px',
                  textTransform: 'none',
                  px: 2,
                  boxShadow: '0 4px 12px rgba(185, 28, 28, 0.25)',
                }}
              >
                Add User Account
              </Button>
            </Box>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['USER / APPLICANT', 'ASSIGNED ROLE', 'VERIFICATION', 'ENROLLED DATE', 'STATUS', 'ACTIONS'].map((h) => (
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
                {users.map((u) => (
                  <TableRow
                    key={u.email}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.15s',
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

                    <TableCell sx={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 500 }}>
                      {u.joined}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={u.status}
                        size="small"
                        sx={{
                          bgcolor:
                            u.status === 'Active'
                              ? '#F0FDF4'
                              : u.status === 'Suspended'
                              ? '#FEF2F2'
                              : '#FFFBEB',
                          color:
                            u.status === 'Active'
                              ? '#15803D'
                              : u.status === 'Suspended'
                              ? '#B91C1C'
                              : '#B45309',
                          border: `1px solid ${
                            u.status === 'Active'
                              ? '#BBF7D0'
                              : u.status === 'Suspended'
                              ? '#FECACA'
                              : '#FDE68A'
                          }`,
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.75 }}>
                        <Tooltip title="Edit Permissions">
                          <IconButton
                            size="small"
                            sx={{
                              color: '#0284C7',
                              bgcolor: '#F0F9FF',
                              border: '1px solid #BAE6FD',
                              borderRadius: '8px',
                              p: 0.7,
                              '&:hover': { bgcolor: '#E0F2FE' },
                            }}
                          >
                            <EditRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Suspend Account">
                          <IconButton
                            size="small"
                            sx={{
                              color: '#B91C1C',
                              bgcolor: '#FEF2F2',
                              border: '1px solid #FECACA',
                              borderRadius: '8px',
                              p: 0.7,
                              '&:hover': { bgcolor: '#FEE2E2' },
                            }}
                          >
                            <BlockRoundedIcon sx={{ fontSize: 16 }} />
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

        {/* System Health Panel */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '20px',
            border: '1.5px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            overflow: 'hidden',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
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
              <SpeedRoundedIcon sx={{ color: '#B91C1C', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                System Telemetry
              </Typography>
            </Box>
            <IconButton size="small" sx={{ color: '#64748B' }}>
              <RefreshRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {systemHealth.map((s) => (
              <Box
                key={s.label}
                sx={{
                  p: 1.75,
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>
                      {s.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: s.color, fontWeight: 700 }}>
                      {s.status}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, bgcolor: '#FFFFFF', px: 1, py: 0.25, borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  ↑ {s.uptime}
                </Typography>
              </Box>
            ))}

            {/* Performance Diagnostic Box */}
            <Box
              sx={{
                mt: 1,
                p: 2.25,
                borderRadius: '14px',
                bgcolor: '#FAF5FF',
                border: '1px solid #E9D5FF',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                <SecurityRoundedIcon sx={{ fontSize: 18, color: '#7E22CE' }} />
                <Typography variant="caption" sx={{ color: '#6B21A8', fontWeight: 800, letterSpacing: '0.04em' }}>
                  SECURITY &amp; COMPLIANCE AUDIT
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                <Typography variant="caption" sx={{ color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                  Average Latency: <strong style={{ color: '#0F172A' }}>142 ms</strong>
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                  Concurrent Sessions: <strong style={{ color: '#0F172A' }}>284 Active</strong>
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                  National Uptime SLA: <strong style={{ color: '#16A34A' }}>99.97% Verified</strong>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
