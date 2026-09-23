import React, { useState } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Chip, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, Avatar, LinearProgress,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TodayIcon from '@mui/icons-material/Today';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const COLOR = '#4A148C';
const GRADIENT = 'linear-gradient(135deg, #7B1FA2, #4A148C)';

const stats = [
  { label: "Today's Inspections", value: '4', color: '#4A148C', bg: '#F3E5F5' },
  { label: "Completed This Week", value: '17', color: '#2E7D32', bg: '#E8F5E9' },
  { label: 'Pending Reports', value: '2', color: '#E65100', bg: '#FFF3E0' },
  { label: 'Total This Month', value: '41', color: '#1565C0', bg: '#E3F2FD' },
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
  Completed: { color: '#2E7D32', bg: '#E8F5E9' },
  'In Progress': { color: '#1565C0', bg: '#E3F2FD' },
  Upcoming: { color: '#4A148C', bg: '#F3E5F5' },
};

export default function FieldOfficerDashboard({ userEmail }) {
  const progress = (17 / 20) * 100;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>FIELD OFFICER PORTAL</Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E', lineHeight: 1.2 }}>Field Dashboard</Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>Officer: {userEmail} — Zone: Delhi Central</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UploadFileIcon />}
          sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700, px: 3, py: 1.2, boxShadow: `0 4px 16px ${COLOR}44` }}
        >
          Submit Report
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid item xs={6} md={3} key={s.label}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E0E0E0', bgcolor: 'white' }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: s.color }}>{s.value}</Typography>
              <Typography variant="body2" sx={{ color: '#757575', mt: 0.5, fontWeight: 500 }}>{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Monthly Progress */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #E0E0E0', bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#1A1A2E' }}>Monthly Target Progress</Typography>
          <Typography variant="body2" sx={{ color: COLOR, fontWeight: 700 }}>17 / 20 inspections</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 10, borderRadius: 5, bgcolor: '#F3E5F5', '& .MuiLinearProgress-bar': { background: GRADIENT, borderRadius: 5 } }}
        />
        <Typography variant="caption" sx={{ color: '#757575', mt: 0.5, display: 'block' }}>
          3 more inspections to meet your monthly target of 20
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Today's Schedule */}
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TodayIcon sx={{ color: COLOR }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Today's Schedule</Typography>
              <Chip label="23 Sep 2026" size="small" sx={{ ml: 'auto', bgcolor: '#F3E5F5', color: COLOR, fontWeight: 600 }} />
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>
              {todaySchedule.map((item, i) => (
                <Box key={i} sx={{
                  p: 2, mb: 1.5, borderRadius: 2,
                  bgcolor: item.status === 'In Progress' ? '#EDE7F6' : 'white',
                  border: `1px solid ${item.status === 'In Progress' ? '#CE93D8' : '#E0E0E0'}`,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, color: '#757575' }} />
                      <Typography variant="caption" sx={{ color: '#616161', fontWeight: 700 }}>{item.time}</Typography>
                    </Box>
                    <Chip label={item.status} size="small" sx={{ bgcolor: scheduleStatusColor[item.status]?.bg, color: scheduleStatusColor[item.status]?.color, fontWeight: 700, fontSize: '0.65rem' }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E' }}>{item.applicant}</Typography>
                  <Typography variant="caption" sx={{ color: '#757575' }}>{item.instrument}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 14, color: '#9C27B0' }} />
                    <Typography variant="caption" sx={{ color: '#616161' }}>{item.address}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Reports */}
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon sx={{ color: COLOR }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Reports</Typography>
            </Box>
            <Divider />
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                  {['Report ID', 'Applicant', 'Result', 'Date'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#424242' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentReports.map(r => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: COLOR, fontSize: '0.78rem' }}>{r.id}</TableCell>
                    <TableCell sx={{ fontSize: '0.82rem' }}>{r.applicant}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.result}
                        size="small"
                        icon={r.result === 'Pass' ? <CheckCircleIcon style={{ fontSize: 12 }} /> : undefined}
                        sx={{ bgcolor: r.result === 'Pass' ? '#E8F5E9' : '#FFEBEE', color: r.result === 'Pass' ? '#2E7D32' : '#B71C1C', fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#757575' }}>{r.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
