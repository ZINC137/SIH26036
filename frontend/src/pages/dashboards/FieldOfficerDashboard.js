import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { useNavigate } from 'react-router-dom';


const COLOR = '#7E22CE';
const GRADIENT = 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)';

const stats = [
  { label: "Today's Assigned Inspections", value: '4', detail: 'Scheduled field visits', icon: TodayRoundedIcon, color: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF' },
  { label: 'Completed This Week', value: '17', detail: 'Calibrated & verified', icon: CheckCircleRoundedIcon, color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  { label: 'Pending Test Reports', value: '2', detail: 'Awaiting field sync', icon: HourglassTopRoundedIcon, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { label: 'Total Calibrated (Month)', value: '41', detail: 'Delhi Central Zone', icon: CalendarMonthRoundedIcon, color: '#0284C7', bg: '#EFF6FF', border: '#BFDBFE' },
];

const todaySchedule = [
  { time: '09:00 AM', applicant: 'Raj Traders', address: 'Shop 14, Karol Bagh, Delhi', instrument: 'Platform Balance 200kg', status: 'Completed' },
  { time: '11:30 AM', applicant: 'Singh Fuels', address: 'Plot 7, Rohini Phase II, Delhi', instrument: 'Fuel Dispenser (3 nozzles)', status: 'Completed' },
  { time: '02:00 PM', applicant: 'Patel Agro', address: 'Village Narela, North Delhi', instrument: 'Moisture Meter', status: 'In Progress' },
  { time: '04:30 PM', applicant: 'Kumar Stores', address: 'Shop 22, Chandni Chowk', instrument: 'Counter Scale 5kg', status: 'Upcoming' },
];

const recentReports = [
  { id: 'RPT-2026-041', applicant: 'Gupta Mart', result: 'Pass', date: '22 Sep 2026' },
  { id: 'RPT-2026-040', applicant: 'Sharma Traders', result: 'Fail', date: '21 Sep 2026' },
  { id: 'RPT-2026-039', applicant: 'Verma Stores', result: 'Pass', date: '20 Sep 2026' },
  { id: 'RPT-2026-038', applicant: 'Mehta Agro', result: 'Pass', date: '19 Sep 2026' },
];

const scheduleStatusColor = {
  Completed: { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  'In Progress': { color: '#0284C7', bg: '#EFF6FF', border: '#BFDBFE' },
  Upcoming: { color: '#6B21A8', bg: '#FAF5FF', border: '#E9D5FF' },
};

export default function FieldOfficerDashboard({ userEmail }) {
  const navigate = useNavigate();
  const progress = (17 / 20) * 100;

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
            Field Officer: <strong style={{ color: '#0F172A' }}>{userEmail || 'anjali@example.com'}</strong> &nbsp;|&nbsp; Operating Circle: <strong>Karol Bagh Circle (Pin: 110005)</strong> &nbsp;|&nbsp; Recommending LMO: <strong>Shri Rajesh Kumar</strong>
          </Typography>
        </Box>


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
            py: 1.4,
            fontSize: '0.92rem',
            textTransform: 'none',
            boxShadow: '0 6px 20px rgba(126, 34, 206, 0.25)',
            '&:hover': {
              background: GRADIENT,
              filter: 'brightness(0.95)',
            },
          }}
        >
          Submit Inspection Report
        </Button>
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
            17 / 20 Completed (85%)
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
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
        <Typography variant="caption" sx={{ color: '#64748B', mt: 1, display: 'block', fontWeight: 500 }}>
          3 remaining on-ground inspections to fulfill statutory monthly quota.
        </Typography>
      </Paper>

      {/* ── Main Split Section: Today's Schedule & Recent Reports ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2.1fr 1fr' },
          gap: 3.5,
        }}
      >
        {/* Today's Schedule Card */}
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
                  Today's Field Verification Roster
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Geotagged inspections for legal metrology stamping
                </Typography>
              </Box>
            </Box>

            <Chip
              label="Delhi Central Zone"
              size="small"
              sx={{
                bgcolor: '#FAF5FF',
                color: '#6B21A8',
                border: '1px solid #E9D5FF',
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            />
          </Box>

          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {todaySchedule.map((item, i) => (
              <Box
                key={i}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: item.status === 'In Progress' ? '#FAF5FF' : '#FFFFFF',
                  border: `1.5px solid ${item.status === 'In Progress' ? '#D8B4FE' : '#E2E8F0'}`,
                  boxShadow: item.status === 'In Progress' ? '0 4px 14px rgba(126, 34, 206, 0.08)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    bgcolor: item.status === 'In Progress' ? '#FAF5FF' : '#F8FAFC',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 800, fontSize: '0.82rem' }}>
                      {item.time}
                    </Typography>
                  </Box>
                  <Chip
                    label={item.status}
                    size="small"
                    sx={{
                      bgcolor: scheduleStatusColor[item.status]?.bg,
                      color: scheduleStatusColor[item.status]?.color,
                      border: `1px solid ${scheduleStatusColor[item.status]?.border}`,
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      borderRadius: '6px',
                    }}
                  />
                </Box>

                <Typography variant="body1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.25 }}>
                  {item.applicant}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.86rem', mb: 1 }}>
                  {item.instrument}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pt: 1, borderTop: '1px solid #F1F5F9' }}>
                  <LocationOnRoundedIcon sx={{ fontSize: 16, color: '#7E22CE' }} />
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>
                    {item.address}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Recent Reports Audit Table */}
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
              <FactCheckRoundedIcon sx={{ color: COLOR, fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                Recent Reports
              </Typography>
            </Box>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['REPORT ID', 'APPLICANT', 'RESULT', 'DATE'].map((h) => (
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
                {recentReports.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 800, color: '#7E22CE', fontSize: '0.8rem' }}>
                      {r.id}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A' }}>
                      {r.applicant}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.result}
                        size="small"
                        icon={r.result === 'Pass' ? <CheckCircleRoundedIcon style={{ fontSize: 13 }} /> : undefined}
                        sx={{
                          bgcolor: r.result === 'Pass' ? '#F0FDF4' : '#FEF2F2',
                          color: r.result === 'Pass' ? '#15803D' : '#B91C1C',
                          border: `1px solid ${r.result === 'Pass' ? '#BBF7D0' : '#FECACA'}`,
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                      {r.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
