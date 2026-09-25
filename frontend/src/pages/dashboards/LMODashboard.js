import React, { useState } from 'react';
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
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';

const COLOR = '#15803D';

const stats = [
  { label: 'Pending Review Queue', value: '24', detail: 'Requires statutory scrutiny', icon: PendingActionsRoundedIcon, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { label: 'Approved This Month', value: '87', detail: 'Certificates issued', icon: VerifiedUserRoundedIcon, color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  { label: 'Field Inspections', value: '13', detail: 'Dispatched to officers', icon: AssignmentTurnedInRoundedIcon, color: '#0284C7', bg: '#EFF6FF', border: '#BFDBFE' },
  { label: 'Officers In Jurisdiction', value: '6', detail: 'Delhi North Zone', icon: HowToRegRoundedIcon, color: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF' },
];

const applications = [
  { id: 'APP-2026-019', applicant: 'Raj Traders', instrument: 'Platform Balance (200kg)', submitted: '20 Sep 2026', priority: 'High', status: 'Pending' },
  { id: 'APP-2026-018', applicant: 'Gupta Mart', instrument: 'Weighing Scale (50kg)', submitted: '19 Sep 2026', priority: 'Normal', status: 'Pending' },
  { id: 'APP-2026-017', applicant: 'Singh Fuels', instrument: 'Fuel Dispenser', submitted: '18 Sep 2026', priority: 'High', status: 'Under Inspection' },
  { id: 'APP-2026-016', applicant: 'Patel Agro', instrument: 'Moisture Meter', submitted: '17 Sep 2026', priority: 'Normal', status: 'Pending' },
  { id: 'APP-2026-015', applicant: 'Kumar Stores', instrument: 'Counter Scale (5kg)', submitted: '16 Sep 2026', priority: 'Low', status: 'Pending' },
];

const officers = [
  { name: 'Suresh Verma', id: 'FO-001', assigned: 4, completed: 12, status: 'Active' },
  { name: 'Meena Sharma', id: 'FO-002', assigned: 3, completed: 9, status: 'Active' },
  { name: 'Ramesh Kumar', id: 'FO-003', assigned: 2, completed: 7, status: 'On Leave' },
];

const priorityColor = {
  High: { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
  Normal: { color: '#0284C7', bg: '#EFF6FF', border: '#BFDBFE' },
  Low: { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
};

const statusColor = {
  Pending: { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  'Under Inspection': { color: '#0284C7', bg: '#EFF6FF', border: '#BFDBFE' },
  Approved: { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  Rejected: { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
};

export default function LMODashboard({ userEmail }) {
  const [applications2, setApplications2] = useState(applications);

  const handleAction = (id, action) => {
    setApplications2((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: action === 'approve' ? 'Approved' : 'Rejected' } : a))
    );
  };

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
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              Jurisdictional Enforcement &amp; Issuance
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
            LMO Jurisdictional Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Designated Officer: <strong style={{ color: '#0F172A' }}>{userEmail || 'lmo@example.com'}</strong> &nbsp;|&nbsp; Jurisdiction: <strong>Delhi North Division</strong>
          </Typography>
        </Box>
      </Box>

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
                {s.value}
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
                  Pending scrutiny, verification and field assignment
                </Typography>
              </Box>
            </Box>

            <Chip
              label="Statutory Scrutiny"
              size="small"
              sx={{
                bgcolor: '#FFFBEB',
                color: '#B45309',
                border: '1px solid #FDE68A',
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            />
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
                {applications2.map((app) => (
                  <TableRow
                    key={app.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 800, color: '#15803D', fontSize: '0.84rem' }}>
                      {app.id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
                      {app.applicant}
                    </TableCell>
                    <TableCell sx={{ color: '#64748B', fontSize: '0.84rem' }}>
                      {app.instrument}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={app.priority}
                        size="small"
                        sx={{
                          bgcolor: priorityColor[app.priority]?.bg,
                          color: priorityColor[app.priority]?.color,
                          border: `1px solid ${priorityColor[app.priority]?.border}`,
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={app.status}
                        size="small"
                        sx={{
                          bgcolor: statusColor[app.status]?.bg || '#F0FDF4',
                          color: statusColor[app.status]?.color || '#15803D',
                          border: `1px solid ${statusColor[app.status]?.border || '#BBF7D0'}`,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {(app.status === 'Pending' || app.status === 'Under Inspection') ? (
                        <Box sx={{ display: 'flex', gap: 0.75 }}>
                          <Tooltip title="Approve & Issue Stamp">
                            <IconButton
                              size="small"
                              onClick={() => handleAction(app.id, 'approve')}
                              sx={{
                                color: '#15803D',
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
                          <Tooltip title="Reject Application">
                            <IconButton
                              size="small"
                              onClick={() => handleAction(app.id, 'reject')}
                              sx={{
                                color: '#B91C1C',
                                bgcolor: '#FEF2F2',
                                border: '1px solid #FECACA',
                                borderRadius: '8px',
                                p: 0.7,
                                '&:hover': { bgcolor: '#FEE2E2' },
                              }}
                            >
                              <CancelRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Inspect Dossier">
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
                              <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                          Processed
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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
              label="3 Active"
              size="small"
              sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 700, fontSize: '0.68rem' }}
            />
          </Box>

          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {officers.map((o) => (
              <Box
                key={o.id}
                sx={{
                  p: 2,
                  borderRadius: '14px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: '#15803D',
                        color: '#FFFFFF',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                      }}
                    >
                      {o.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                        {o.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        ID: {o.id}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={o.status}
                    size="small"
                    sx={{
                      bgcolor: o.status === 'Active' ? '#F0FDF4' : '#FFFBEB',
                      color: o.status === 'Active' ? '#15803D' : '#B45309',
                      border: `1px solid ${o.status === 'Active' ? '#BBF7D0' : '#FDE68A'}`,
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      borderRadius: '6px',
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    pt: 1,
                    borderTop: '1px solid #E2E8F0',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Assigned Today: <strong style={{ color: '#0F172A' }}>{o.assigned}</strong>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Completed: <strong style={{ color: '#15803D' }}>{o.completed}</strong>
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
