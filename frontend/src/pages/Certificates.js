import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import VerifiedIcon from '@mui/icons-material/Verified';

const mockCertificates = [
  {
    id: 'CERT-2024-001',
    instrumentType: 'Electronic Scale',
    serialNumber: 'ES-2024-001',
    certificateNumber: 'LM/DL/2024/0001',
    issuedDate: '2026-08-25',
    validUntil: '2027-08-25',
    status: 'Active',
    qrCode: '████████████████████',
  },
  {
    id: 'CERT-2024-002',
    instrumentType: 'Weighing Balance',
    serialNumber: 'WB-2024-002',
    certificateNumber: 'LM/DL/2024/0002',
    issuedDate: '2026-08-20',
    validUntil: '2027-08-20',
    status: 'Active',
    qrCode: '████████████████████',
  },
  {
    id: 'CERT-2024-003',
    instrumentType: 'Pressure Gauge',
    serialNumber: 'PG-2024-003',
    certificateNumber: 'LM/DL/2024/0003',
    issuedDate: '2026-07-15',
    validUntil: '2027-07-15',
    status: 'Active',
    qrCode: '████████████████████',
  },
];

export default function Certificates() {
  const [selectedCert, setSelectedCert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleViewCertificate = (cert) => {
    setSelectedCert(cert);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCert(null);
  };

  const handleDownload = (cert) => {
    alert(`Downloading certificate: ${cert.certificateNumber}`);
  };

  const handlePrint = (cert) => {
    alert(`Printing certificate: ${cert.certificateNumber}`);
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
          Digital Certificates
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          View, download, and manage your instrument verification certificates.
        </Typography>
      </Box>

      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D47A1' }}>
              {mockCertificates.length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Total Certificates
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#4CAF50' }}>
              {mockCertificates.filter((c) => c.status === 'Active').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Active
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9800' }}>
              0
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Expiring Soon
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Certificates Grid */}
      <Grid container spacing={3}>
        {mockCertificates.map((cert) => (
          <Grid item xs={12} md={6} key={cert.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #E0E0E0',
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                {/* Certificate Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D47A1' }}>
                      {cert.instrumentType}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>
                      Serial: {cert.serialNumber}
                    </Typography>
                  </Box>
                  <VerifiedIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Certificate Details */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#757575' }}>
                      Certificate Number
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {cert.certificateNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#757575' }}>
                      Status
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                      {cert.status}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#757575' }}>
                      Issued Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {cert.issuedDate}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#757575' }}>
                      Valid Until
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {cert.validUntil}
                    </Typography>
                  </Grid>
                </Grid>

                {/* QR Code Section */}
                <Box sx={{ bgcolor: '#F5F5F5', p: 2, textAlign: 'center', borderRadius: 1, mb: 3 }}>
                  <Typography variant="caption" sx={{ color: '#757575', display: 'block', mb: 1 }}>
                    QR Code
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-block',
                      p: 2,
                      bgcolor: 'white',
                      border: '2px solid #0D47A1',
                      borderRadius: 1,
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {cert.qrCode}
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: '#0D47A1', flex: 1 }}
                    startIcon={<PrintIcon />}
                    onClick={() => handleViewCertificate(cert)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ borderColor: '#0D47A1', color: '#0D47A1', flex: 1 }}
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(cert)}
                  >
                    Download
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Certificate Viewer Dialog */}
      {selectedCert && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#0D47A1', color: 'white', fontWeight: 700 }}>
            Digital Certificate Viewer
          </DialogTitle>
          <DialogContent sx={{ mt: 3 }}>
            {/* Certificate Preview */}
            <Paper
              sx={{
                p: 4,
                bgcolor: '#FAFAFA',
                border: '3px solid #0D47A1',
                textAlign: 'center',
                mb: 3,
              }}
            >
              {/* Header */}
              <Box sx={{ mb: 3, borderBottom: '2px solid #0D47A1', pb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D47A1' }}>
                  LEGAL METROLOGY VERIFICATION CERTIFICATE
                </Typography>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Government of India | Ministry of Consumer Affairs
                </Typography>
              </Box>

              {/* Certificate Number */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                  Certificate Number
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D47A1' }}>
                  {selectedCert.certificateNumber}
                </Typography>
              </Box>

              {/* Details */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    Instrument Type
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {selectedCert.instrumentType}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    Serial Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {selectedCert.serialNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    Issued Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {selectedCert.issuedDate}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    Valid Until
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {selectedCert.validUntil}
                  </Typography>
                </Grid>
              </Grid>

              {/* QR Code */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#757575', display: 'block', mb: 1 }}>
                  Verification QR Code
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    p: 3,
                    bgcolor: 'white',
                    border: '3px solid #0D47A1',
                    borderRadius: 1,
                    fontSize: '10px',
                    fontFamily: 'monospace',
                  }}
                >
                  █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █<br/>
                  █ ▀ ▀ ▀ ▀ ▀ ▀ ▀ ▀ ▀ ▀ ▀ ▀ ▀ ▀ ▀ █<br/>
                  █ ▀ █ █ █ █ █ ▀ █ █ █ █ █ ▀ █ ▀ █<br/>
                  █ ▀ █ ▀ ▀ ▀ █ ▀ █ ▀ ▀ ▀ █ ▀ █ ▀ █<br/>
                  █ ▀ █ ▀ █ ▀ █ ▀ █ ▀ █ ▀ █ ▀ █ ▀ █<br/>
                  █ ▀ █ ▀ ▀ ▀ █ ▀ █ ▀ ▀ ▀ █ ▀ █ ▀ █<br/>
                  █ ▀ █ █ █ █ █ ▀ █ █ █ █ █ ▀ █ ▀ █<br/>
                </Box>
              </Box>

              {/* Footer */}
              <Box sx={{ borderTop: '2px solid #0D47A1', pt: 2 }}>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  This is a digitally signed certificate. Scan the QR code to verify authenticity.
                </Typography>
              </Box>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              variant="outlined"
              sx={{ borderColor: '#0D47A1', color: '#0D47A1' }}
              startIcon={<PrintIcon />}
              onClick={() => handlePrint(selectedCert)}
            >
              Print
            </Button>
            <Button
              variant="contained"
              sx={{ bgcolor: '#0D47A1' }}
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload(selectedCert)}
            >
              Download PDF
            </Button>
            <Button onClick={handleCloseDialog} variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}
