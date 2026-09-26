import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Button, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  IconButton, Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import VerifiedIcon from '@mui/icons-material/Verified';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CancelIcon from '@mui/icons-material/Cancel';

const COLOR = '#7E22CE';

export default function FOHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

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

  const filtered = reports.filter((r) => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Approved' && r.status === 'Approved') ||
      (filter === 'Awaiting' && r.status === 'Inspection Reported') ||
      (filter === 'Rejected' && r.status === 'Rejected');

    const q = search.toLowerCase();
    const matchesSearch =
      r.applicant?.toLowerCase().includes(q) ||
      r.id?.toLowerCase().includes(q) ||
      r.appId?.toLowerCase().includes(q) ||
      (r.certificateNo && r.certificateNo.toLowerCase().includes(q)) ||
      (r.instrument && r.instrument.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const totalCount = reports.length;
  const certifiedCount = reports.filter((r) => r.status === 'Approved').length;
  const awaitingCount = reports.filter((r) => r.status === 'Inspection Reported').length;
  const rejectedCount = reports.filter((r) => r.status === 'Rejected').length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* ── Top Header ── */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
            <Chip
              label="FIELD VERIFICATION &amp; INSPECTION HISTORY"
              size="small"
              sx={{ bgcolor: '#FAF5FF', color: COLOR, fontWeight: 800, fontSize: '0.7rem' }}
            />
            <Chip
              label="FORM D STAMPING &amp; CALIBRATION AUDIT"
              size="small"
              sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 700, fontSize: '0.7rem' }}
            />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>
            Inspection History &amp; Issued Certificates
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Historical record of on-ground physical inspections, test findings, and resulting legal metrology stamping certificates.
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

      {/* ── KPI Summary Cards ── */}
      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: '14px', border: '1.5px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Inspections Done</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mt: 0.5 }}>{totalCount}</Typography>
            </Box>
            <Box sx={{ p: 1, bgcolor: '#FAF5FF', color: COLOR, borderRadius: '10px' }}><FactCheckIcon /></Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: '14px', border: '1.5px solid #BBF7D0', bgcolor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700, textTransform: 'uppercase' }}>Certificates Issued</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#166534', mt: 0.5 }}>{certifiedCount}</Typography>
            </Box>
            <Box sx={{ p: 1, bgcolor: '#DCFCE7', color: '#15803D', borderRadius: '10px' }}><VerifiedIcon /></Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: '14px', border: '1.5px solid #E9D5FF', bgcolor: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#7E22CE', fontWeight: 700, textTransform: 'uppercase' }}>Awaiting LMO Sign</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#6B21A8', mt: 0.5 }}>{awaitingCount}</Typography>
            </Box>
            <Box sx={{ p: 1, bgcolor: '#F3E8FF', color: '#7E22CE', borderRadius: '10px' }}><CheckCircleIcon /></Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: '14px', border: '1.5px solid #FECACA', bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#B91C1C', fontWeight: 700, textTransform: 'uppercase' }}>Tolerances Exceeded</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#991B1B', mt: 0.5 }}>{rejectedCount}</Typography>
            </Box>
            <Box sx={{ p: 1, bgcolor: '#FEE2E2', color: '#B91C1C', borderRadius: '10px' }}><CancelIcon /></Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Filters ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by Report ID, App Ref, Certificate No, or Applicant..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9E9E9E' }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 320, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={filter}
            label="Status Filter"
            onChange={(e) => setFilter(e.target.value)}
            sx={{ borderRadius: '12px', bgcolor: '#FFFFFF' }}
          >
            <MenuItem value="All">All Completed Inspections</MenuItem>
            <MenuItem value="Approved">Certificates Issued by LMO</MenuItem>
            <MenuItem value="Awaiting">Awaiting LMO DSC Signing</MenuItem>
            <MenuItem value="Rejected">Rejected / Stamping Refused</MenuItem>
          </Select>
        </FormControl>
        <Chip
          label={`${filtered.length} Record${filtered.length !== 1 ? 's' : ''}`}
          sx={{ bgcolor: '#F1F5F9', fontWeight: 800, alignSelf: 'center', height: 36, px: 1 }}
        />
      </Box>

      {/* ── Reports & Certificates Table ── */}
      <Paper elevation={0} sx={{ borderRadius: '20px', border: '1.5px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: COLOR }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <FactCheckIcon sx={{ fontSize: 54, color: '#CBD5E1', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155' }}>
              No Inspection Records Found
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 440, mx: 'auto', mt: 0.5 }}>
              Verification reports submitted on-site will be archived here along with the final certificates signed by LMOs.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['REPORT / APP REF', 'APPLICANT FIRM', 'INSTRUMENT', 'INSP. DATE', 'FIELD TEST', 'CERTIFICATE / STATUS', 'ACTIONS'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.72rem', color: '#475569', py: 1.75 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r) => {
                  const hasCert = Boolean(r.certificateNo);
                  return (
                    <TableRow key={r.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      {/* Report ID & App ID */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: COLOR, fontSize: '0.82rem', fontFamily: 'monospace' }}>
                          {r.id}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>
                          {r.appId}
                        </Typography>
                      </TableCell>

                      {/* Applicant */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {r.applicant}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {r.address}
                        </Typography>
                      </TableCell>

                      {/* Instrument */}
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                          {r.instrument}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Seal: {r.sealNo || 'N/A'}
                        </Typography>
                      </TableCell>

                      {/* Inspection Date */}
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.82rem' }}>
                          {r.date}
                        </Typography>
                      </TableCell>

                      {/* Test Result */}
                      <TableCell>
                        <Chip
                          label={r.result?.replace(' (Pending LMO Sign)', '') || 'N/A'}
                          size="small"
                          sx={{
                            bgcolor: r.result?.includes('Pass') ? '#E8F5E9' : r.result?.includes('Fail') ? '#FFEBEE' : '#FFF3E0',
                            color: r.result?.includes('Pass') ? '#2E7D32' : r.result?.includes('Fail') ? '#B71C1C' : '#E65100',
                            fontWeight: 800,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>

                      {/* Certificate / Status */}
                      <TableCell>
                        {hasCert ? (
                          <Box>
                            <Chip
                              icon={<VerifiedIcon sx={{ fontSize: '1rem !important' }} />}
                              label={r.certificateNo}
                              size="small"
                              sx={{
                                bgcolor: '#F0FDF4',
                                color: '#15803D',
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                border: '1px solid #BBF7D0',
                                fontFamily: 'monospace',
                              }}
                            />
                            <Typography variant="caption" sx={{ display: 'block', color: '#15803D', fontWeight: 600, mt: 0.3 }}>
                              Valid to: {r.certificateValidUntil}
                            </Typography>
                          </Box>
                        ) : (
                          <Chip
                            label={r.status === 'Rejected' ? 'Stamping Refused' : 'Awaiting LMO Sign'}
                            size="small"
                            sx={{
                              bgcolor: r.status === 'Rejected' ? '#FEF2F2' : '#FAF5FF',
                              color: r.status === 'Rejected' ? '#B91C1C' : '#7E22CE',
                              fontWeight: 800,
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {hasCert && (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<VerifiedIcon sx={{ fontSize: '0.95rem !important' }} />}
                              onClick={() => setSelectedCert(r)}
                              sx={{
                                bgcolor: '#15803D',
                                color: '#FFFFFF',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                borderRadius: '8px',
                                px: 1.2,
                                py: 0.4,
                                '&:hover': { bgcolor: '#166534' },
                              }}
                            >
                              Certificate
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon sx={{ fontSize: '0.95rem !important' }} />}
                            onClick={() => setSelectedReport(r)}
                            sx={{
                              color: '#475569',
                              borderColor: '#CBD5E1',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              borderRadius: '8px',
                              px: 1.2,
                              py: 0.4,
                              '&:hover': { bgcolor: '#F8FAFC' },
                            }}
                          >
                            Details
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      {/* ── CERTIFICATE VIEW DIALOG FOR FIELD INSPECTOR ── */}
      <Dialog
        open={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', border: '2px solid #BBF7D0' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#F0FDF4', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <VerifiedIcon sx={{ color: '#15803D', fontSize: 26 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#166534' }}>
                Issued Stamping Certificate — Schedule VIII (Form D)
              </Typography>
              <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 600 }}>
                Signed by LMO pursuant to your on-site verification findings
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setSelectedCert(null)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {selectedCert && (
            <Box sx={{ border: '2px solid #0F2B4E', p: { xs: 2, sm: 4 }, borderRadius: '16px', bgcolor: '#FFFFFF' }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 800 }}>
                  GOVERNMENT OF INDIA &bull; LEGAL METROLOGY DIVISION
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F2B4E', my: 0.5 }}>
                  CERTIFICATE OF VERIFICATION (FORM D)
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
                  Rule 11 Statutory Instrument Clearance
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#F8FAFC', p: 2, borderRadius: '12px', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>CERTIFICATE NO:</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#15803D', fontFamily: 'monospace' }}>{selectedCert.certificateNo}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>VALIDITY PERIOD:</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2B4E' }}>{selectedCert.certificateIssuedAt} to {selectedCert.certificateValidUntil}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>LEAD SEAL NUMBER:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F2B4E', fontFamily: 'monospace' }}>{selectedCert.sealNo}</Typography>
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, border: '1px solid #F1F5F9', borderRadius: '10px' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>APPLICANT / COMMERCIAL FIRM</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2B4E', mt: 0.5 }}>{selectedCert.applicant}</Typography>
                    <Typography variant="body2" sx={{ color: '#334155' }}>{selectedCert.address}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, border: '1px solid #F1F5F9', borderRadius: '10px' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>VERIFIED INSTRUMENT</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2B4E', mt: 0.5 }}>{selectedCert.instrument}</Typography>
                    <Typography variant="body2" sx={{ color: '#334155' }}>Make: {selectedCert.make || 'Standard'} | S/N: {selectedCert.serialNo || selectedCert.raw?.serial_no}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0', mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 800 }}>PHYSICAL VERIFICATION ENDORSEMENT</Typography>
                <Typography variant="body2" sx={{ color: '#166534', mt: 0.5, fontWeight: 600 }}>
                  This instrument was verified on-site by you (<strong>{selectedCert.stampedBy}</strong>) with recorded MPE tolerance error of {selectedCert.errorPct}%. Stamping certificate was reviewed and issued under DSC by the jurisdictional LMO.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 2, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QrCode2Icon sx={{ fontSize: 56, color: '#0F2B4E' }} />
                  <Typography variant="caption" sx={{ color: '#64748B' }}>Traceable on National Stamping Gateway</Typography>
                </Box>
                <Box sx={{ textAlign: 'right', border: '1px dashed #15803D', p: 1.5, borderRadius: '8px', bgcolor: '#F0FDF4' }}>
                  <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 800, display: 'block' }}>DSC SIGNED BY LMO</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>Legal Metrology Officer</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC' }}>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ bgcolor: '#0F2B4E', color: '#FFFFFF', fontWeight: 700 }}>
            Print Certificate
          </Button>
          <Button onClick={() => setSelectedCert(null)} sx={{ color: '#64748B', fontWeight: 700 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── REPORT DETAIL MODAL ── */}
      <Dialog
        open={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1A1A2E' }}>
          Inspection Record — {selectedReport?.id}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {selectedReport && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              {[
                ['Application Ref', selectedReport.appId],
                ['Applicant Firm', selectedReport.applicant],
                ['Instrument Details', selectedReport.instrument],
                ['Inspection Date', selectedReport.date],
                ['Field Test Result', selectedReport.result],
                ['Error Tolerance (%)', `${selectedReport.errorPct ?? 0.02}%`],
                ['Environmental Conditions', selectedReport.environmentalTemp || '26°C, 52% RH'],
                ['Security Lead Seal No', selectedReport.sealNo || '—'],
                ['LMO Review Status', selectedReport.lmoStatus],
                ['Certificate No', selectedReport.certificateNo || 'Pending LMO Signature'],
                ['Certificate Validity', selectedReport.certificateValidUntil || 'Not applicable'],
                ['Inspecting Officer', selectedReport.stampedBy || 'Authorized Field Inspector'],
                ['Field Observations', selectedReport.notes || 'Verified against working standards.'],
                ['Rejection Reason', selectedReport.rejectionReason || 'N/A'],
              ].map(([k, v]) => (
                <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', pb: 0.75 }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>{k}:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>{v}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedReport(null)} sx={{ color: '#64748B', fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
