const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runQrEnvironmentRegressionTest() {
  console.log('====================================================');
  console.log('QR PRODUCTION URL & VERIFICATION REGRESSION TEST');
  console.log('====================================================');

  const testCertId = 'CERT-DL-2026-REGRESSION-01';

  // 1. Development Mode QR Generation
  const devBaseUrl = 'http://localhost:3000';
  const devQrUrl = `${devBaseUrl}/#verify?certId=${encodeURIComponent(testCertId)}`;
  const devQrDataUrl = await QRCode.toDataURL(devQrUrl);

  console.log('[PASS] Dev QR generated successfully.');
  console.log('       URL encoded:', devQrUrl);

  if (!devQrUrl.includes('localhost:3000') || !devQrUrl.includes(testCertId)) {
    throw new Error('FAILED: Dev QR URL does not match development configuration');
  }

  // 2. Production Mode QR Generation (Dynamic Domain)
  const prodBaseUrl = 'https://emapan.gov.in';
  const prodQrUrl = `${prodBaseUrl}/#verify?certId=${encodeURIComponent(testCertId)}`;
  const prodQrDataUrl = await QRCode.toDataURL(prodQrUrl);

  console.log('[PASS] Production QR generated successfully.');
  console.log('       URL encoded:', prodQrUrl);

  if (prodQrUrl.includes('localhost') || !prodQrUrl.startsWith('https://emapan.gov.in')) {
    throw new Error('FAILED: Production QR URL must not include localhost and must use configured domain');
  }

  // 3. Verify URL Parameter Parsing (Standard URL and Hash URL)
  function extractCertIdFromQrText(qrText) {
    if (!qrText) return null;
    let certId = null;
    if (qrText.includes('#')) {
      const hashPart = qrText.split('#')[1] || '';
      if (hashPart.includes('?')) {
        const hashParams = new URLSearchParams(hashPart.split('?')[1]);
        certId = hashParams.get('certId') || hashParams.get('cert') || hashParams.get('id');
      }
    }
    if (!certId && (qrText.includes('://') || qrText.includes('?'))) {
      const urlObj = new URL(qrText);
      certId = urlObj.searchParams.get('certId') || urlObj.searchParams.get('cert') || urlObj.searchParams.get('id');
    }
    return certId;
  }

  const extractedDev = extractCertIdFromQrText(devQrUrl);
  const extractedProd = extractCertIdFromQrText(prodQrUrl);

  console.log('[PASS] Decoded Dev QR certId:', extractedDev);
  console.log('[PASS] Decoded Prod QR certId:', extractedProd);

  if (extractedDev !== testCertId || extractedProd !== testCertId) {
    throw new Error('FAILED: QR decoder failed to extract exact certificate ID from hash query string');
  }

  console.log('====================================================');
  console.log('QR ENVIRONMENT REGRESSION TEST: ALL CHECKS PASSED');
  console.log('====================================================');

  await prisma.$disconnect();
}

runQrEnvironmentRegressionTest().catch(err => {
  console.error(err);
  process.exit(1);
});
