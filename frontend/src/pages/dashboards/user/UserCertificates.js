import React from 'react';
import {
  Box, Paper, Typography, Grid, Button, Chip, Divider, Alert,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const COLOR = '#E65100';
const GRADIENT = 'linear-gradient(135deg, #FF6D00, #E65100)';

const certificates = [
  { id: 'CERT-2026-001', instrument: 'Weighing Scale (50kg)', serial: 'AWT-001', issued: '15 Sep 2026', expires: '15 Sep 2027', lmo: 'R. Sharma', status: 'Valid' },
  { id: 'CERT-2026-002', instrument: 'Weighing Scale (100kg)', serial: 'AWT-004', issued: '01 Sep 2026', expires: '01 Sep 2027', lmo: 'R. Sharma', status: 'Valid' },
  { id: 'CERT-2026-003', instrument: 'Counter Scale (5kg)', serial: 'CS-022', issued: '10 Aug 2026', expires: '10 Aug 2027', lmo: 'M. Singh', status: 'Valid' },
  { id: 'CERT-2025-011', instrument: 'Pressure Gauge', serial: 'PG-099', issued: '01 Aug 2025', expires: '01 Aug 2026', lmo: 'A. Kumar', status: 'Expired' },
  { id: 'CERT-2025-008', instrument: 'Platform Balance', serial: 'PB-201', issued: '15 Jun 2025', expires: '15 Jun 2026', lmo: 'R. Sharma', status: 'Expired' },
];

export default function UserCertificates() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>USER PORTAL</Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>My Certificates</Typography>
        <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>Download and manage your verification certificates</Typography>
      </Box>

      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} icon={<WarningAmberIcon />}>
        <strong>2 certificates have expired.</strong> Apply for re-verification to maintain compliance.
      </Alert>

      <Grid container spacing={3}>
        {certificates.map((cert) => (
          <Grid item xs={12} md={6} key={cert.id}>
            <Paper elevation={0} sx={{
              borderRadius: 3,
              border: `2px solid ${cert.status === 'Valid' ? '#C8E6C9' : '#FFCDD2'}`,
              overflow: 'hidden',
            }}>
              {/* Certificate Header */}
              <Box sx={{
                p: 2.5,
                background: cert.status === 'Valid'
                  ? 'linear-gradient(135deg, #2E7D32, #1B5E20)'
                  : 'linear-gradient(135deg, #C62828, #B71C1C)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedIcon sx={{ color: 'white', fontSize: 24 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', display: 'block' }}>Certificate No.</Typography>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 700 }}>{cert.id}</Typography>
                  </Box>
                </Box>
                <Chip
                  label={cert.status}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
                />
              </Box>

              {/* Certificate Body */}
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A2E', mb: 0.5 }}>{cert.instrument}</Typography>
                <Typography variant="caption" sx={{ color: '#757575' }}>S/N: {cert.serial}</Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={1.5}>
                  {[
                    ['Issued On', cert.issued],
                    ['Expires On', cert.expires],
                    ['Issuing LMO', cert.lmo],
                  ].map(([k, v]) => (
                    <Grid item xs={4} key={k}>
                      <Typography variant="caption" sx={{ color: '#9E9E9E', display: 'block' }}>{k}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: cert.status === 'Expired' && k === 'Expires On' ? '#B71C1C' : '#1A1A2E' }}>{v}</Typography>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
                  {cert.status === 'Valid' ? (
                    <Button variant="contained" startIcon={<DownloadIcon />} fullWidth
                      sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700 }}>
                      Download PDF
                    </Button>
                  ) : (
                    <Button variant="outlined" fullWidth
                      sx={{ borderColor: COLOR, color: COLOR, borderRadius: 2, fontWeight: 700 }}
                      onClick={() => window.location.href = '/dashboard/user/apply'}>
                      Apply for Re-Verification
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
