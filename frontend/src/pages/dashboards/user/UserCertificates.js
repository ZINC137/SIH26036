import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Chip, Divider, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ShieldIcon from '@mui/icons-material/Shield';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from 'react-router-dom';

const COLOR = '#E65100';
const GRADIENT = 'linear-gradient(135deg, #FF6D00, #E65100)';

export default function UserCertificates() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/certificates', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.certificates) {
          setCertificates(data.certificates);
        } else {
          setError(data.error || 'Failed to load certificates');
        }
      })
      .catch(() => setError('Unable to connect to government certification service.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>
            PUBLIC USER PORTAL
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>
            Statutory Verification Certificates
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>
            Official Schedule VIII (Form D) Certificates issued under Rule 11 of the Legal Metrology Act, 2009.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => navigate('/dashboard/user/apply')}
          sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700, px: 3 }}
        >
          New Verification Application
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: COLOR }} />
        </Box>
      ) : certificates.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed #E0E0E0' }}>
          <VerifiedIcon sx={{ fontSize: 56, color: '#BDBDBD', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#424242' }}>
            No Active Stamping Certificates Found
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', maxWidth: 460, mx: 'auto', mt: 1, mb: 3 }}>
            You do not currently have any stamped instruments. Once an on-ground field inspection is completed and approved, your official certificate will appear here.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard/user/apply')}
            sx={{ background: GRADIENT, fontWeight: 700, borderRadius: 2 }}
          >
            Apply for Verification Now
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {certificates.map((cert) => (
            <Grid item xs={12} md={6} key={cert.id}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `2px solid ${cert.status === 'Valid' ? '#C8E6C9' : '#FFCDD2'}`,
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                }}
              >
                {/* Certificate Header */}
                <Box
                  sx={{
                    p: 2.5,
                    background:
                      cert.status === 'Valid'
                        ? 'linear-gradient(135deg, #15803D 0%, #166534 100%)'
                        : 'linear-gradient(135deg, #C62828 0%, #B71C1C 100%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <VerifiedIcon sx={{ color: '#FFFFFF', fontSize: 28 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', fontWeight: 600 }}>
                        FORM D CERTIFICATE NO.
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 800, fontFamily: 'monospace' }}>
                        {cert.id}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={cert.status.toUpperCase()}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#FFFFFF', fontWeight: 800 }}
                  />
                </Box>

                {/* Certificate Body */}
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 0.5 }}>
                    {cert.instrument}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>
                    Make: <strong>{cert.make}</strong> &nbsp;|&nbsp; Serial No: <strong>{cert.serial}</strong>
                  </Typography>

                  <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', mb: 2.5 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                      SECURITY LEAD SEAL AFFIXED:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#1E293B', fontFamily: 'monospace' }}>
                      🔒 {cert.securitySeal}
                    </Typography>
                  </Box>

                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {[
                      ['Issued On', cert.issued],
                      ['Valid Until', cert.expires],
                      ['Stamping Officer', cert.stampedBy],
                    ].map(([k, v]) => (
                      <Grid item xs={4} key={k}>
                        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontWeight: 600 }}>
                          {k}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem' }}>
                          {v}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<PrintIcon />}
                      fullWidth
                      onClick={() => setSelectedCert(cert)}
                      sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700 }}
                    >
                      View / Print Form D
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── OFFICIAL FORM D CERTIFICATE MODAL ── */}
      <Dialog
        open={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldIcon sx={{ color: '#15803D' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Official Stamping Document — {selectedCert?.id}
            </Typography>
          </Box>
          <IconButton onClick={() => setSelectedCert(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ p: { xs: 2, sm: 4 } }}>
          {selectedCert && (
            <Paper
              elevation={0}
              id="printable-certificate"
              sx={{
                p: { xs: 2, sm: 4 },
                border: '3px double #15803D',
                borderRadius: 2,
                bgcolor: '#FEFCF9',
                position: 'relative',
              }}
            >
              {/* Government Header */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="caption" sx={{ letterSpacing: 2, fontWeight: 800, color: '#15803D', display: 'block' }}>
                  GOVERNMENT OF NCT OF DELHI
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', textTransform: 'uppercase', mt: 0.5 }}>
                  DEPARTMENT OF LEGAL METROLOGY (WEIGHTS &amp; MEASURES)
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#C2410C', mt: 0.5 }}>
                  CERTIFICATE OF VERIFICATION
                </Typography>
                <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#64748B' }}>
                  [See Rule 11 of Legal Metrology (General) Rules, 2011 — Schedule VIII, Form D]
                </Typography>
              </Box>

              <Divider sx={{ my: 2, borderColor: '#CBD5E1' }} />

              {/* Certificate Metadata Bar */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>CERTIFICATE NO.</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#15803D', fontFamily: 'monospace' }}>
                    {selectedCert.id}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>APPLICATION REF.</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {selectedCert.appId}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>DATE OF ISSUE</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {selectedCert.issued}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>VALID UNTIL</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#15803D' }}>
                    {selectedCert.expires}
                  </Typography>
                </Grid>
              </Grid>

              {/* Statutory Statement */}
              <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.8, mb: 3, textAlign: 'justify' }}>
                This is to certify that the weighing and measuring instrument belonging to{' '}
                <strong>{selectedCert.business}</strong> situated at{' '}
                <strong>{selectedCert.address}</strong> has been duly verified, tested against standard working weights, and stamped with the statutory seal in accordance with the provisions of the{' '}
                <strong>Legal Metrology Act, 2009</strong> and rules framed thereunder.
              </Typography>

              {/* Instrument Table */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#FFFFFF', borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>INSTRUMENT TYPE &amp; SPECIFICATION</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>{selectedCert.instrument}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>MAKE &amp; MODEL</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{selectedCert.make}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>SERIAL NUMBER</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>{selectedCert.serial}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>LEAD SECURITY SEAL NO.</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#7E22CE', fontFamily: 'monospace' }}>
                      {selectedCert.securitySeal}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>STATUTORY VERIFICATION FEE PAID</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#15803D' }}>
                      ₹{selectedCert.fee} (BharatKosh Settled)
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Signatures & QR Code */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 2, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1, bgcolor: '#F1F5F9', borderRadius: 1.5, display: 'flex' }}>
                    <QrCode2Icon sx={{ fontSize: 60, color: '#0F172A' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                      SCAN TO VERIFY STAMP
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace' }}>
                      gov.lm.delhi/{selectedCert.id}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 800, display: 'block' }}>
                    [DIGITALLY SIGNED &amp; STAMPED]
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {selectedCert.stampedBy}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                    Inspector / Legal Metrology Officer
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setSelectedCert(null)} sx={{ color: '#64748B', fontWeight: 600 }}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ background: GRADIENT, fontWeight: 700, px: 3 }}
          >
            Print Form D Certificate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
