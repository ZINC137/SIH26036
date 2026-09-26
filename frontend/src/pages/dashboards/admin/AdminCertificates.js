import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Chip, Divider, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, InputAdornment, FormControl, InputLabel,
  Select, MenuItem,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const COLOR = '#B91C1C';

export default function AdminCertificates() {
  const [verifications, setVerifications] = useState([]);
  const [stats, setStats] = useState({
    totalVerifications: 0,
    certificatesIssued: 0,
    activeCertificates: 0,
    underInspection: 0,
    awaitingSigning: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedDossier, setSelectedDossier] = useState(null);

  const fetchVerifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/verifications', { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.verifications) {
        setVerifications(data.verifications);
        if (data.stats) setStats(data.stats);
      } else {
        setError(data.error || 'Failed to retrieve state-wide verifications.');
      }
    } catch (err) {
      setError('Unable to connect to Central Directorate verification registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const filtered = verifications.filter((v) => {
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Approved' && v.status === 'Approved') ||
      (statusFilter === 'Reported' && v.status === 'Inspection Reported') ||
      (statusFilter === 'Inspecting' && v.status === 'Under Inspection') ||
      (statusFilter === 'Rejected' && v.status === 'Rejected');

    const q = search.toLowerCase();
    const matchesSearch =
      (v.certificateNo && v.certificateNo.toLowerCase().includes(q)) ||
      (v.appNumber && v.appNumber.toLowerCase().includes(q)) ||
      (v.businessName && v.businessName.toLowerCase().includes(q)) ||
      (v.serialNo && v.serialNo.toLowerCase().includes(q)) ||
      (v.instrumentType && v.instrumentType.toLowerCase().includes(q)) ||
      (v.assignedFoName && v.assignedFoName.toLowerCase().includes(q)) ||
      (v.city && v.city.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* ── Top Header ── */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
            <Chip
              label="CENTRAL DIRECTORATE OF LEGAL METROLOGY"
              size="small"
              sx={{ bgcolor: '#FEF2F2', color: COLOR, fontWeight: 800, fontSize: '0.7rem' }}
            />
            <Chip
              label="STATE-WIDE MASTER VERIFICATION &amp; CERTIFICATE REGISTRY"
              size="small"
              sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: '0.7rem' }}
            />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A' }}>
            State-Wide Verification &amp; Certificate History
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Central repository of all physical inspections, statutory Form D certificates, calibration records, and compliance findings.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchVerifications}
          sx={{ borderColor: '#CBD5E1', color: '#475569', fontWeight: 700 }}
        >
          Refresh Registry
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* ── KPI Summary Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1.5px solid #BBF7D0',
              bgcolor: '#F0FDF4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700, textTransform: 'uppercase' }}>
                Certificates Issued
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#166534', mt: 0.5 }}>
                {stats.certificatesIssued}
              </Typography>
              <Typography variant="caption" sx={{ color: '#15803D' }}>
                Form D Sealed Instruments
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#DCFCE7', borderRadius: '12px', color: '#15803D' }}>
              <VerifiedIcon sx={{ fontSize: 32 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1.5px solid #BFDBFE',
              bgcolor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 700, textTransform: 'uppercase' }}>
                Active &amp; Valid
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#1E40AF', mt: 0.5 }}>
                {stats.activeCertificates}
              </Typography>
              <Typography variant="caption" sx={{ color: '#2563EB' }}>
                State-Wide In-Service
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#DBEAFE', borderRadius: '12px', color: '#1D4ED8' }}>
              <CheckCircleIcon sx={{ fontSize: 32 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1.5px solid #E9D5FF',
              bgcolor: '#FAF5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#7E22CE', fontWeight: 700, textTransform: 'uppercase' }}>
                Awaiting LMO Sign
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#6B21A8', mt: 0.5 }}>
                {stats.awaitingSigning}
              </Typography>
              <Typography variant="caption" sx={{ color: '#7E22CE' }}>
                FO Reports Forwarded
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#F3E8FF', borderRadius: '12px', color: '#7E22CE' }}>
              <FactCheckIcon sx={{ fontSize: 32 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1.5px solid #FECACA',
              bgcolor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#B91C1C', fontWeight: 700, textTransform: 'uppercase' }}>
                Rejections / Deficient
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#991B1B', mt: 0.5 }}>
                {stats.rejected}
              </Typography>
              <Typography variant="caption" sx={{ color: '#DC2626' }}>
                MPE Tolerances Exceeded
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#FEE2E2', borderRadius: '12px', color: '#B91C1C' }}>
              <CancelIcon sx={{ fontSize: 32 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Filters & Search ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by Certificate No, Business, District, Inspector, Serial..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94A3B8' }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 320, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
        />
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ borderRadius: '12px', bgcolor: '#FFFFFF' }}
          >
            <MenuItem value="All">All Historical Verifications</MenuItem>
            <MenuItem value="Approved">Certificates Issued (Approved)</MenuItem>
            <MenuItem value="Reported">Awaiting LMO DSC Signing</MenuItem>
            <MenuItem value="Inspecting">Under Field Inspection</MenuItem>
            <MenuItem value="Rejected">Rejected / Refused Stamping</MenuItem>
          </Select>
        </FormControl>
        <Chip
          label={`${filtered.length} Record${filtered.length !== 1 ? 's' : ''}`}
          sx={{ bgcolor: '#F1F5F9', fontWeight: 800, alignSelf: 'center', height: 36, px: 1 }}
        />
      </Box>

      {/* ── Main Data Table ── */}
      <Paper elevation={0} sx={{ borderRadius: '20px', border: '1.5px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: COLOR }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <VerifiedIcon sx={{ fontSize: 54, color: '#CBD5E1', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155' }}>
              No Historical Verifications Match Criteria
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 440, mx: 'auto', mt: 0.5 }}>
              All on-ground tests conducted by Field Officers and certificates signed by LMOs are logged in real-time here.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 950 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['CERTIFICATE / REF', 'APPLICANT & LOCATION', 'INSTRUMENT DETAILS', 'INSPECTOR (FO)', 'LEAD SEAL NO', 'VALIDITY PERIOD', 'STATUS', 'ACTIONS'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.72rem', color: '#475569', py: 1.75 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((v) => {
                  const hasCert = Boolean(v.certificateNo);
                  return (
                    <TableRow key={v.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      {/* Certificate & App ID */}
                      <TableCell>
                        {hasCert ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#15803D', fontFamily: 'monospace' }}>
                              {v.certificateNo}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'monospace' }}>
                              App: {v.appNumber}
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748B', fontFamily: 'monospace' }}>
                              {v.appNumber}
                            </Typography>
                            <Typography variant="caption" sx={{ color: v.status === 'Rejected' ? '#B91C1C' : '#7E22CE', fontWeight: 600 }}>
                              {v.status === 'Rejected' ? 'Stamping Refused' : v.status}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>

                      {/* Business & City */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {v.businessName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {v.city}, {v.state}
                        </Typography>
                      </TableCell>

                      {/* Instrument */}
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                          {v.instrumentType}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {v.make} | S/N: {v.serialNo} ({v.capacity})
                        </Typography>
                      </TableCell>

                      {/* Inspector FO */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {v.assignedFoName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {v.inspectionDate ? `Tested: ${v.inspectionDate}` : 'Under Inspection'}
                        </Typography>
                      </TableCell>

                      {/* Seal No */}
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: '#F8FAFC', px: 1, py: 0.5, borderRadius: '6px', border: '1px solid #E2E8F0', fontWeight: 700 }}>
                          {v.securitySealNo || '—'}
                        </Typography>
                      </TableCell>

                      {/* Validity */}
                      <TableCell>
                        {hasCert ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.8rem' }}>
                              {v.certificateIssuedAt}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700 }}>
                              To: {v.certificateValidUntil}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                            {v.inspectionDate ? `Tested: ${v.inspectionDate}` : `Submitted: ${v.submittedAt}`}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {hasCert ? (
                          <Chip
                            label={v.validityStatus === 'Active' ? 'Active Certificate' : 'Expired'}
                            size="small"
                            sx={{
                              bgcolor: v.validityStatus === 'Active' ? '#F0FDF4' : '#FEF2F2',
                              color: v.validityStatus === 'Active' ? '#15803D' : '#B91C1C',
                              fontWeight: 800,
                              fontSize: '0.68rem',
                              border: `1px solid ${v.validityStatus === 'Active' ? '#BBF7D0' : '#FECACA'}`,
                            }}
                          />
                        ) : (
                          <Chip
                            label={v.status}
                            size="small"
                            sx={{
                              bgcolor: v.status === 'Rejected' ? '#FEF2F2' : v.status === 'Inspection Reported' ? '#FAF5FF' : '#EFF6FF',
                              color: v.status === 'Rejected' ? '#B91C1C' : v.status === 'Inspection Reported' ? '#7E22CE' : '#1D4ED8',
                              fontWeight: 800,
                              fontSize: '0.68rem',
                              border: `1px solid ${v.status === 'Rejected' ? '#FECACA' : '#E2E8F0'}`,
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
                              startIcon={<VerifiedIcon sx={{ fontSize: '1rem !important' }} />}
                              onClick={() => setSelectedCert(v)}
                              sx={{
                                bgcolor: '#15803D',
                                color: '#FFFFFF',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                borderRadius: '8px',
                                px: 1.5,
                                '&:hover': { bgcolor: '#166534' },
                              }}
                            >
                              Certificate
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FactCheckIcon sx={{ fontSize: '1rem !important' }} />}
                            onClick={() => setSelectedDossier(v)}
                            sx={{
                              color: '#475569',
                              borderColor: '#CBD5E1',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              borderRadius: '8px',
                              px: 1.2,
                              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
                            }}
                          >
                            Dossier
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

      {/* ── STATUTORY CERTIFICATE MODAL ── */}
      <Dialog
        open={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            border: '2px solid #BBF7D0',
            boxShadow: '0 25px 50px -12px rgba(21, 128, 61, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#F0FDF4',
            borderBottom: '1px solid #BBF7D0',
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <VerifiedIcon sx={{ color: '#15803D', fontSize: 26 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#166534' }}>
                Legal Metrology Stamping Certificate — Schedule VIII (Form D)
              </Typography>
              <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 600 }}>
                Rule 11 Statutory Instrument Clearance &bull; Directorate Central Supervision
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setSelectedCert(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {selectedCert && (
            <Box
              sx={{
                border: '2px solid #0F2B4E',
                p: { xs: 2, sm: 4 },
                borderRadius: '16px',
                bgcolor: '#FFFFFF',
                position: 'relative',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: '0.1em' }}>
                  GOVERNMENT OF INDIA &bull; STATE DIRECTORATE OF LEGAL METROLOGY
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F2B4E', my: 0.5 }}>
                  OFFICIAL CERTIFICATE OF VERIFICATION (FORM D)
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block' }}>
                  Issued under Section 24 of Legal Metrology Act, 2009
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  mb: 3,
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                    CERTIFICATE NUMBER:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#15803D', fontFamily: 'monospace' }}>
                    {selectedCert.certificateNo}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                    VALIDITY PERIOD:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2B4E' }}>
                    {selectedCert.certificateIssuedAt} to {selectedCert.certificateValidUntil}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                    SECURITY SEAL:
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F2B4E', fontFamily: 'monospace' }}>
                    {selectedCert.securitySealNo || 'SEAL-DL-VERIFIED'}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, border: '1px solid #F1F5F9', borderRadius: '10px' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>VERIFIED BUSINESS OWNER</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2B4E', mt: 0.5 }}>{selectedCert.businessName}</Typography>
                    <Typography variant="body2" sx={{ color: '#334155' }}>{selectedCert.address}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>Contact: {selectedCert.contactName} ({selectedCert.contactPhone})</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, border: '1px solid #F1F5F9', borderRadius: '10px' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>INSTRUMENT DOSSIER</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2B4E', mt: 0.5 }}>{selectedCert.instrumentType}</Typography>
                    <Typography variant="body2" sx={{ color: '#334155' }}>Make: {selectedCert.make} | Model: {selectedCert.model || 'Commercial'}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>Serial No: {selectedCert.serialNo} | Capacity: {selectedCert.capacity}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0', mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 800 }}>STATUTORY COMPLIANCE STATEMENT</Typography>
                <Typography variant="body2" sx={{ color: '#166534', mt: 0.5, fontWeight: 600 }}>
                  Certified that the instrument has been calibrated and tested on-ground by Field Inspector <strong>{selectedCert.assignedFoName}</strong>. Found within statutory tolerance limits ({selectedCert.errorPercentage}%) and stamped under Legal Metrology Rules.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 2, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QrCode2Icon sx={{ fontSize: 64, color: '#0F2B4E' }} />
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#0F2B4E' }}>
                      NIC e-Stamping QR
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem' }}>
                      Directly traceable in Central Legal Metrology Database
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'right', border: '1px dashed #15803D', p: 1.5, borderRadius: '8px', bgcolor: '#F0FDF4' }}>
                  <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 800, display: 'block' }}>
                    CRYPTOGRAPHICALLY SIGNED VIA DSC
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
                    Authorized Legal Metrology Officer
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                    Key ID: DSC-DL-2026-SHA256
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ bgcolor: '#0F2B4E', color: '#FFFFFF', fontWeight: 700, borderRadius: '10px' }}
          >
            Print / Save Certificate
          </Button>
          <Button onClick={() => setSelectedCert(null)} sx={{ color: '#64748B', fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DOSSIER MODAL ── */}
      <Dialog
        open={Boolean(selectedDossier)}
        onClose={() => setSelectedDossier(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F2B4E' }}>
          Statutory Verification Dossier — {selectedDossier?.appNumber}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {selectedDossier && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              {[
                ['Application Number', selectedDossier.appNumber],
                ['Certificate No', selectedDossier.certificateNo || 'Not Issued (Rejected / Pending)'],
                ['Applicant Business', selectedDossier.businessName],
                ['Jurisdiction / City', `${selectedDossier.city}, ${selectedDossier.state}`],
                ['Instrument Details', `${selectedDossier.instrumentType} (${selectedDossier.capacity})`],
                ['Manufacturer / Make', selectedDossier.make],
                ['Serial Number', selectedDossier.serialNo],
                ['Inspecting Field Officer', selectedDossier.assignedFoName],
                ['Physical Inspection Date', selectedDossier.inspectionDate || '—'],
                ['Test Result', selectedDossier.inspectionResult],
                ['Tolerance Error %', `${selectedDossier.errorPercentage}% (Permissible: +/- 0.1%)`],
                ['Security Lead Seal No', selectedDossier.securitySealNo || '—'],
                ['Statutory Observations', selectedDossier.inspectionNotes || 'Compliant with Schedule VII.'],
                ['Rejection Reason', selectedDossier.rejectionReason || 'N/A'],
              ].map(([label, val]) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', pb: 0.75 }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>{label}:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>{val}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedDossier(null)} sx={{ color: '#64748B', fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
