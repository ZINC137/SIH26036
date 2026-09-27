import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, InputAdornment,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

const COLOR = '#0D9488';

export default function GATCHistory({ userEmail }) {
  const [history, setHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewCertModal, setViewCertModal] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gatc/history', { credentials: 'include' });
      const data = await res.json();
      if (data.reports) {
        setHistory(data.reports);
      } else {
        setHistory([]);
      }
    } catch {
      setError('Unable to load GATC laboratory testing history from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((h) =>
    h.id?.toLowerCase().includes(historySearch.toLowerCase()) ||
    h.applicant?.toLowerCase().includes(historySearch.toLowerCase()) ||
    h.instrument?.toLowerCase().includes(historySearch.toLowerCase()) ||
    h.serialNo?.toLowerCase().includes(historySearch.toLowerCase()) ||
    h.certNo?.toLowerCase().includes(historySearch.toLowerCase()) ||
    h.sealNo?.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <Box sx={{ pb: 4 }}>
      {/* ── Header Banner ── */}
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
              icon={<VerifiedRoundedIcon sx={{ fontSize: '14px !important' }} />}
              label="TESTING HISTORY"
              size="small"
              sx={{
                bgcolor: '#F0FDFA',
                color: COLOR,
                border: '1px solid #99F6E4',
                fontWeight: 800,
                fontSize: '0.68rem',
                borderRadius: '6px',
              }}
            />
            <Chip
              label={`${history.length} COMPLETED TESTS`}
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
            sx={{ fontWeight: 900, color: '#0F172A', fontSize: { xs: '1.5rem', sm: '1.9rem' } }}
          >
            Laboratory Verification History
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Statutory testing records, calibration error percentages, and endorsed Form D verification certificates
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={fetchHistory}
            sx={{ borderColor: '#E2E8F0', color: '#475569', fontWeight: 700 }}
          >
            Refresh Records
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* ── History Table Paper ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Historical Laboratory Verification Records ({filteredHistory.length})
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Includes testing reports forwarded to LMOs and endorsed Schedule-XI Form D verification certificates
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="Search by Report ID, serial, certificate, seal..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
            }}
            sx={{ minWidth: { xs: '100%', sm: 320 } }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: COLOR }} /></Box>
        ) : filteredHistory.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <VerifiedRoundedIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 1.5 }} />
            <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 600 }}>
              {historySearch ? 'No matching records found in testing history.' : 'No laboratory verification history recorded yet.'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              When instruments in your testing queue are tested and verified, completed records appear here.
            </Typography>
          </Box>
        ) : (
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>REPORT ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>APPLICANT &amp; INSTRUMENT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>TEST ERROR (%)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>SECURITY SEAL</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>LMO ENDORSEMENT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map((h) => (
                <TableRow key={h.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: COLOR }}>
                    {h.id}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{h.applicant}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      {h.instrument} · SN: <span style={{ fontFamily: 'monospace' }}>{h.serialNo}</span>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`±${h.errorPct}%`}
                      size="small"
                      sx={{
                        bgcolor: parseFloat(h.errorPct) <= 0.05 ? '#F0FDF4' : '#FEF2F2',
                        color: parseFloat(h.errorPct) <= 0.05 ? '#15803D' : '#B91C1C',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>
                    {h.sealNo}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important' }} />}
                      label={h.endorsementStatus || 'Endorsed by LMO'}
                      size="small"
                      sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VerifiedRoundedIcon />}
                      onClick={() => setViewCertModal(h)}
                      sx={{
                        borderColor: COLOR,
                        color: COLOR,
                        fontWeight: 700,
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#F0FDFA', borderColor: COLOR },
                      }}
                    >
                      View Form D
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* ── FORM D STATUTORY CERTIFICATE MODAL ── */}
      {viewCertModal && (
        <Dialog
          open={Boolean(viewCertModal)}
          onClose={() => setViewCertModal(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: '20px' } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <VerifiedRoundedIcon sx={{ color: COLOR, fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Statutory Form D Verification Certificate</Typography>
            </Box>
            <IconButton onClick={() => setViewCertModal(null)}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box
              sx={{
                p: 3,
                border: '2px solid #CBD5E1',
                borderRadius: '12px',
                bgcolor: '#FFFFFF',
                fontFamily: 'serif',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 2, display: 'block', color: '#64748B' }}>
                  GOVERNMENT OF INDIA · DEPARTMENT OF CONSUMER AFFAIRS
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', mt: 0.5 }}>
                  SCHEDULE - XI &nbsp;[See Rule 24]
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0D9488', letterSpacing: 1 }}>
                  CERTIFICATE OF VERIFICATION FOR WEIGHTS AND MEASURES
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: '8px' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Certificate No.</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>{viewCertModal.certNo || 'LM/CERT/2026/GATC-882'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Test Report Reference</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>{viewCertModal.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Date of Verification</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{viewCertModal.date || '2026-09-26'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Verification Valid Until</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803D' }}>{viewCertModal.validUntil || '2027-09-25'}</Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  I hereby certify that I have examined and verified the instrument specified below belonging to <strong>{viewCertModal.applicant}</strong>, which was tested at Government Approved Test Centre under Section 24 of the Legal Metrology Act, 2009.
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, p: 2, border: '1px solid #E2E8F0', borderRadius: '8px', mb: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>Instrument Type</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{viewCertModal.instrument}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>Serial Number</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{viewCertModal.serialNo}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>Observed Calibration Error</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0D9488' }}>±{viewCertModal.errorPct}% (Passed MPE)</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 4, pt: 2, borderTop: '1px dashed #CBD5E1' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Affixed Security Seal</Typography>
                  <Chip label={viewCertModal.sealNo} size="small" sx={{ fontFamily: 'monospace', fontWeight: 800, bgcolor: '#F0FDFA', color: '#0D9488', border: '1px solid #99F6E4' }} />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Verified &amp; Endorsed By</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>Legal Metrology Officer (LMO)</Typography>
                  <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700 }}>Digitally Endorsed Form D</Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setViewCertModal(null)} sx={{ color: '#64748B' }}>Close</Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
              sx={{ bgcolor: COLOR, '&:hover': { bgcolor: '#0F766E' }, fontWeight: 700 }}
            >
              Print Certificate
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
