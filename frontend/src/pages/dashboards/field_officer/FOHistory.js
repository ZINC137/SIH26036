import React, { useState } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Button, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';

const COLOR = '#4A148C';
const GRADIENT = 'linear-gradient(135deg, #7B1FA2, #4A148C)';

const REPORTS = [
  { id: 'RPT-2026-041', appId: 'APP-2026-018', applicant: 'Gupta Mart', instrument: 'Weighing Scale 50kg', date: '22 Sep 2026', result: 'Pass', lmo: 'Approved' },
  { id: 'RPT-2026-040', appId: 'APP-2026-015', applicant: 'Sharma Traders', instrument: 'Platform Balance', date: '21 Sep 2026', result: 'Fail', lmo: 'Reviewed' },
  { id: 'RPT-2026-039', appId: 'APP-2026-013', applicant: 'Verma Stores', instrument: 'Counter Scale', date: '20 Sep 2026', result: 'Pass', lmo: 'Approved' },
  { id: 'RPT-2026-038', appId: 'APP-2026-011', applicant: 'Mehta Agro', instrument: 'Moisture Meter', date: '19 Sep 2026', result: 'Pass', lmo: 'Approved' },
  { id: 'RPT-2026-037', appId: 'APP-2026-009', applicant: 'Jain Traders', instrument: 'Fuel Dispenser', date: '18 Sep 2026', result: 'Conditional', lmo: 'Pending' },
  { id: 'RPT-2026-036', appId: 'APP-2026-007', applicant: 'Patel Corp', instrument: 'Crane Scale 2T', date: '17 Sep 2026', result: 'Pass', lmo: 'Approved' },
];

const resultColor = { Pass: { c: '#2E7D32', bg: '#E8F5E9' }, Fail: { c: '#B71C1C', bg: '#FFEBEE' }, Conditional: { c: '#E65100', bg: '#FFF3E0' } };
const lmoColor = { Approved: { c: '#2E7D32', bg: '#E8F5E9' }, Reviewed: { c: '#1565C0', bg: '#E3F2FD' }, Pending: { c: '#E65100', bg: '#FFF3E0' } };

export default function FOHistory() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = REPORTS.filter(r =>
    (filter === 'All' || r.result === filter) &&
    (r.applicant.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search))
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>FIELD OFFICER PORTAL</Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>Report History</Typography>
        <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>{REPORTS.length} reports submitted</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField placeholder="Search by ID or applicant..." size="small" value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
          sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Result</InputLabel>
          <Select value={filter} label="Result" onChange={(e) => setFilter(e.target.value)} sx={{ borderRadius: 2 }}>
            {['All', 'Pass', 'Fail', 'Conditional'].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                {['Report ID', 'App ID', 'Applicant', 'Instrument', 'Date', 'Result', 'LMO Status', 'Action'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#424242', fontSize: '0.8rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: COLOR, fontSize: '0.8rem' }}>{r.id}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#757575' }}>{r.appId}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.applicant}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#616161' }}>{r.instrument}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#757575' }}>{r.date}</TableCell>
                  <TableCell>
                    <Chip label={r.result} size="small" sx={{ bgcolor: resultColor[r.result]?.bg, color: resultColor[r.result]?.c, fontWeight: 700, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={r.lmo} size="small" sx={{ bgcolor: lmoColor[r.lmo]?.bg, color: lmoColor[r.lmo]?.c, fontWeight: 600, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="small" startIcon={<VisibilityIcon />} sx={{ color: '#1565C0', fontSize: '0.73rem', fontWeight: 600 }}>View</Button>
                      <Button size="small" startIcon={<DownloadIcon />} sx={{ color: COLOR, fontSize: '0.73rem', fontWeight: 600 }}>PDF</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}
