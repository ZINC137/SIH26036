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

const COLOR = '#15803D';

export default function LMOCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({
    totalCertificates: 0,
    activeCertificates: 0,
    rejectedVerifications: 0,
    awaitingSigning: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedDossier, setSelectedDossier] = useState(null);

  const fetchCertificates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/lmo/certificates', { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.certificates) {
        setCertificates(data.certificates);
        if (data.stats) setStats(data.stats);
      } else {
        setError(data.error || 'Failed to retrieve certificate history.');
      }
    } catch (err) {
      setError('Unable to connect to certificate registry service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const filtered = certificates.filter((c) => {
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && c.validityStatus === 'Active') ||
      (statusFilter === 'Expired' && c.validityStatus === 'Expired') ||
      (statusFilter === 'Rejected' && c.status === 'Rejected') ||
      (statusFilter === 'Awaiting' && c.status === 'Inspection Reported');

    const q = search.toLowerCase();
    const matchesSearch =
      (c.certificateNo && c.certificateNo.toLowerCase().includes(q)) ||
      (c.appNumber && c.appNumber.toLowerCase().includes(q)) ||
      (c.businessName && c.businessName.toLowerCase().includes(q)) ||
      (c.serialNo && c.serialNo.toLowerCase().includes(q)) ||
      (c.instrumentType && c.instrumentType.toLowerCase().includes(q)) ||
      (c.assignedFoName && c.assignedFoName.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* ── Top Header ── */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
            <Chip
              label="LEGAL METROLOGY ACT, 2009 — SECTION 24"
              size="small"
              sx={{ bgcolor: '#F0FDF4', color: COLOR, fontWeight: 800, fontSize: '0.7rem' }}
            />
            <Chip
              label="FORM D (RULE 11) CERTIFICATE REGISTRY"
              size="small"
              sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: '0.7rem' }}
            />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>
            Certificate Registry &amp; Past Verifications
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Audit trail of issued verification certificates, physical inspection dossiers, and stamping authorizations.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchCertificates}
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
                Total Stamped
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#166534', mt: 0.5 }}>
                {stats.totalCertificates}
              </Typography>
              <Typography variant="caption" sx={{ color: '#15803D' }}>
                Certificates Issued
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
                Within 1-Yr Validity
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
                FO Reports Awaiting
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#6B21A8', mt: 0.5 }}>
                {stats.awaitingSigning}
              </Typography>
              <Typography variant="caption" sx={{ color: '#7E22CE' }}>
                Ready for LMO Sign
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
                Refused / Exceeded
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#991B1B', mt: 0.5 }}>
                {stats.rejectedVerifications}
              </Typography>
              <Typography variant="caption" sx={{ color: '#DC2626' }}>
                Verification Failed
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
          placeholder="Search by Certificate No, Business, App ID, Serial No..."
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
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter Records</InputLabel>
          <Select
            value={statusFilter}
            label="Filter Records"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ borderRadius: '12px', bgcolor: '#FFFFFF' }}
          >
            <MenuItem value="All">All Historical Records</MenuItem>
            <MenuItem value="Active">Active Valid Certificates</MenuItem>
            <MenuItem value="Expired">Expired Certificates</MenuItem>
            <MenuItem value="Awaiting">Awaiting LMO Signature</MenuItem>
            <MenuItem value="Rejected">Rejected / Failed Verification</MenuItem>
          </Select>
        </FormControl>
        <Chip
          label={`${filtered.length} Record${filtered.length !== 1 ? 's' : ''}`}
          sx={{ bgcolor: '#F1F5F9', fontWeight: 800, alignSelf: 'center', height: 36, px: 1 }}
        />
      </Box>

      {/* ── Main Certificates & Past Verification Table ── */}
      <Paper elevation={0} sx={{ borderRadius: '20px', border: '1.5px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: COLOR }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <VerifiedIcon sx={{ fontSize: 54, color: '#CBD5E1', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155' }}>
              No Verification Records Found
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 440, mx: 'auto', mt: 0.5 }}>
              Applications approved by LMO or inspected by Field Officers will appear here with full Form D Certificate and physical audit trail.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['CERTIFICATE / APP REF', 'APPLICANT FIRM', 'INSTRUMENT DETAILS', 'INSPECTING FO', 'SEAL NO', 'ISSUED / VALIDITY', 'STATUS', 'ACTIONS'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.72rem', color: '#475569', py: 1.75 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((c) => {
                  const hasCert = Boolean(c.certificateNo);
                  return (
                    <TableRow key={c.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      {/* Certificate No & App Number */}
                      <TableCell>
                        {hasCert ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: COLOR, fontFamily: 'monospace' }}>
                              {c.certificateNo}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'monospace' }}>
                              App: {c.appNumber}
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748B', fontFamily: 'monospace' }}>
                              {c.appNumber}
                            </Typography>
                            <Typography variant="caption" sx={{ color: c.status === 'Rejected' ? '#B91C1C' : '#7E22CE', fontWeight: 600 }}>
                              {c.status === 'Rejected' ? 'Stamping Refused' : 'Awaiting Sign'}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>

                      {/* Applicant Business */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {c.businessName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {c.contactPerson} ({c.contactPhone})
                        </Typography>
                      </TableCell>

                      {/* Instrument */}
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                          {c.instrumentType}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {c.make} | S/N: {c.serialNo} ({c.capacity})
                        </Typography>
                      </TableCell>

                      {/* Field Inspector */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {c.assignedFoName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Insp: {c.inspectionDate || 'Completed'}
                        </Typography>
                      </TableCell>

                      {/* Security Seal */}
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: '#F8FAFC', px: 1, py: 0.5, borderRadius: '6px', border: '1px solid #E2E8F0', fontWeight: 700 }}>
                          {c.securitySealNo || '—'}
                        </Typography>
                      </TableCell>

                      {/* Issued & Validity */}
                      <TableCell>
                        {hasCert ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.8rem' }}>
                              Issued: {c.certificateIssuedAt}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700 }}>
                              Valid to: {c.certificateValidUntil}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                            {c.inspectionDate ? `Tested: ${c.inspectionDate}` : `Submitted: ${c.submittedAt}`}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Status Chip */}
                      <TableCell>
                        {hasCert ? (
                          <Chip
                            label={c.validityStatus === 'Active' ? 'Active Certificate' : 'Expired'}
                            size="small"
                            sx={{
                              bgcolor: c.validityStatus === 'Active' ? '#F0FDF4' : '#FEF2F2',
                              color: c.validityStatus === 'Active' ? '#15803D' : '#B91C1C',
                              fontWeight: 800,
                              fontSize: '0.68rem',
                              border: `1px solid ${c.validityStatus === 'Active' ? '#BBF7D0' : '#FECACA'}`,
                            }}
                          />
                        ) : (
                          <Chip
                            label={c.status === 'Rejected' ? 'Rejected' : 'Under Review'}
                            size="small"
                            sx={{
                              bgcolor: c.status === 'Rejected' ? '#FEF2F2' : '#FAF5FF',
                              color: c.status === 'Rejected' ? '#B91C1C' : '#7E22CE',
                              fontWeight: 800,
                              fontSize: '0.68rem',
                              border: `1px solid ${c.status === 'Rejected' ? '#FECACA' : '#E9D5FF'}`,
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
                              onClick={() => setSelectedCert(c)}
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
                            onClick={() => setSelectedDossier(c)}
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

      {/* ── STATUTORY FORM D CERTIFICATE PREVIEW MODAL ── */}
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
                Issued pursuant to Rule 11 of the Legal Metrology (General) Rules, 2011
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
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: '0.1em' }}>
                  GOVERNMENT OF NATIONAL CAPITAL TERRITORY OF DELHI
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F2B4E', my: 0.5 }}>
                  DEPARTMENT OF LEGAL METROLOGY (WEIGHTS &amp; MEASURES)
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block' }}>
                  STATUTORY VERIFICATION &amp; STAMPING CERTIFICATE [RULE 11]
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Certificate Meta Banner */}
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
                    STATUTORY VALIDITY:
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

              {/* Data Grid */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, border: '1px solid #F1F5F9', borderRadius: '10px' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>VERIFIED APPLICANT / USER</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2B4E', mt: 0.5 }}>{selectedCert.businessName}</Typography>
                    <Typography variant="body2" sx={{ color: '#334155' }}>{selectedCert.address}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>Contact: {selectedCert.contactName} ({selectedCert.contactPhone})</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, border: '1px solid #F1F5F9', borderRadius: '10px' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>INSTRUMENT SPECIFICATIONS</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2B4E', mt: 0.5 }}>{selectedCert.instrumentType}</Typography>
                    <Typography variant="body2" sx={{ color: '#334155' }}>Make: {selectedCert.make} | Model: {selectedCert.model || 'Standard'}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>Serial No: {selectedCert.serialNo} | Capacity: {selectedCert.capacity}</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Verification findings */}
              <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0', mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 800 }}>STATUTORY COMPLIANCE STATEMENT</Typography>
                <Typography variant="body2" sx={{ color: '#166534', mt: 0.5, fontWeight: 600 }}>
                  This is to certify that the weighing / measuring instrument described above has been physically inspected by Field Officer <strong>{selectedCert.assignedFoName} ({selectedCert.assignedFoCode})</strong>, verified against working standards under the Legal Metrology Act, 2009, error found within permissible limits ({selectedCert.errorPercentage}%), and authorized for commercial use.
                </Typography>
              </Box>

              {/* Bottom Signatures */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 2, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QrCode2Icon sx={{ fontSize: 64, color: '#0F2B4E' }} />
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#0F2B4E' }}>
                      NIC e-Stamping QR
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem' }}>
                      Scan to verify certificate authenticity on national portal
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'right', border: '1px dashed #15803D', p: 1.5, borderRadius: '8px', bgcolor: '#F0FDF4' }}>
                  <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 800, display: 'block' }}>
                    CRYPTOGRAPHICALLY SIGNED VIA DSC
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
                    Legal Metrology Officer (LMO)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                    Key ID: DSC-DL-2026-SHA256 | NCT of Delhi
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

      {/* ── INSPECTION DOSSIER DIALOG ── */}
      <Dialog
        open={Boolean(selectedDossier)}
        onClose={() => setSelectedDossier(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F2B4E' }}>
          Physical Inspection Dossier — {selectedDossier?.appNumber}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {selectedDossier && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              {[
                ['Application Number', selectedDossier.appNumber],
                ['Certificate No', selectedDossier.certificateNo || 'Not Issued (Rejected/Pending)'],
                ['Applicant Business', selectedDossier.businessName],
                ['Instrument Details', `${selectedDossier.instrumentType} (${selectedDossier.capacity})`],
                ['Manufacturer / Make', selectedDossier.make],
                ['Serial Number', selectedDossier.serialNo],
                ['Inspecting Field Officer', `${selectedDossier.assignedFoName} (${selectedDossier.assignedFoCode})`],
                ['Physical Inspection Date', selectedDossier.inspectionDate || '—'],
                ['Test Result', selectedDossier.inspectionResult],
                ['Tolerance Error %', `${selectedDossier.errorPercentage}% (Permissible: +/- 0.1%)`],
                ['Security Lead Seal No', selectedDossier.securitySealNo || '—'],
                ['Statutory Observations', selectedDossier.inspectionNotes || 'All test points compliant.'],
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
