import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import QRCode from 'qrcode';

export default function CertificateQrCode({
  certificateNumber,
  serialNumber,
  ownerName,
  instrumentType,
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    
    // Dynamic origin resolution from environment or browser runtime
    const frontendBase =
      (process.env.REACT_APP_FRONTEND_URL || '').trim() ||
      (typeof window !== 'undefined' && window.location && window.location.origin
        ? window.location.origin
        : 'http://localhost:3000');

    const certId = encodeURIComponent(certificateNumber || 'UNISSUED');
    const verificationUrl = `${frontendBase}/#verify?certId=${certId}`;

    setQrDataUrl('');
    setError('');
    QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 180,
      color: { dark: '#0F172A', light: '#FFFFFF' },
    }).then((dataUrl) => {
      if (active) setQrDataUrl(dataUrl);
    }).catch((qrError) => {
      console.error('Certificate QR generation failed:', qrError);
      if (active) setError('Unable to generate the certificate QR code.');
    });

    return () => {
      active = false;
    };
  }, [certificateNumber]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 112,
          height: 112,
          p: 1,
          bgcolor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {qrDataUrl ? (
          <Box component="img" src={qrDataUrl} alt="Scannable demo certificate QR code" sx={{ width: '100%', height: '100%' }} />
        ) : error ? (
          <Typography variant="caption" color="error" sx={{ textAlign: 'center' }}>{error}</Typography>
        ) : (
          <CircularProgress size={24} />
        )}
      </Box>
      <Box>
        <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: '#0F172A' }}>
          SCAN CERTIFICATE DATA
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: '#64748B', fontSize: '0.68rem' }}>
          Demo signature only - not an official verification.
        </Typography>
      </Box>
    </Box>
  );
}
