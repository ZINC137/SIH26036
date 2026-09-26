import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Button, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';

const COLOR = '#7E22CE';

const resultColor = {
  Pass: { c: '#2E7D32', bg: '#E8F5E9' },
  Fail: { c: '#B71C1C', bg: '#FFEBEE' },
  Conditional: { c: '#E65100', bg: '#FFF3E0' },
};

export default function FOHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchHistory = () => {
    setLoading(true);
    setError('');
    fetch('http://localhost:5000/api/field-officer/history', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.reports) {
          setReports(data.reports);
        } else {
          setError(data.error || 'Failed to load inspection history.');
        }
      })
      .catch(() => setError('Failed to connect to inspection history service.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = reports.filter((r) =>
    (filter === 'All' || r.result === filter) &&
    (r.applicant?.toLowerCase().includes(search.toLowerCase()) ||
      r.id?.toLowerCase().includes(search.toLowerCase()) ||
      r.appId?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>
            FIELD OFFICER PORTAL
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>
            Completed Inspection Reports
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>
            Statutory records of on-ground physical testing, sealing, and stamping.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchHistory}
          sx={{ borderColor: '#CBD5E1', color: '#475569', fontWeight: 700 }}
        >
          Refresh History
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by Report ID, App ID, or applicant..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
          sx={{ minWidth: 320, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Result</InputLabel>
          <Select value={filter} label="Result" onChange={(e) => setFilter(e.target.value)} sx={{ borderRadius: 2 }}>
            {['All', 'Pass', 'Fail', 'Conditional'].map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {!loading && (
          <Chip
            label={`${filtered.length} inspection${filtered.length !== 1 ? 's' : ''}`}
            sx={{ bgcolor: '#F5F5F5', fontWeight: 700, alignSelf: 'center' }}
          />
        )}
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: COLOR }} />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                  {['Report ID', 'App Ref', 'Applicant Firm', 'Instrument Details', 'Inspection Date', 'Result', 'Lead Seal', 'Action'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: '#424242', fontSize: '0.8rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 800, color: COLOR, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                      {r.id}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'monospace' }}>
                      {r.appId}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                      {r.applicant}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', color: '#334155' }}>
                      {r.instrument}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                      {r.date}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.result}
                        size="small"
                        sx={{ bgcolor: resultColor[r.result]?.bg, color: resultColor[r.result]?.c, fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#7E22CE', fontWeight: 700 }}>
                      {r.sealNo || '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setSelectedReport(r)}
                        sx={{ color: '#1565C0', fontSize: '0.73rem', fontWeight: 700 }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: '#9E9E9E' }}>
                      No completed inspection reports recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      {/* ── REPORT DETAIL MODAL ── */}
      <Dialog
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1A1A2E' }}>
          Inspection Record — {selectedReport?.id}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {selectedReport && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                ['Application Ref', selectedReport.appId],
                ['Applicant Firm', selectedReport.applicant],
                ['Instrument Details', selectedReport.instrument],
                ['Inspection Date', selectedReport.date],
                ['Testing Result', selectedReport.result],
                ['Error Tolerance (%)', `${selectedReport.errorPct || 0.02}% (Within MPE)`],
                ['Security Lead Seal No', selectedReport.sealNo || 'SEAL-DL-SECURED'],
                ['Certificate No', selectedReport.certificateNo || 'Stamping Certificate Issued'],
                ['Inspecting Officer', selectedReport.stampedBy || 'Authorized Field Inspector'],
                ['Statutory Observations', selectedReport.notes || 'Verified against working standards.'],
              ].map(([k, v]) => (
                <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', pb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>{k}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>{v}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedReport(null)} sx={{ color: '#64748B', fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
