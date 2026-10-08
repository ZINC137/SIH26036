import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { authFetch } from '../config/api';
import { useLanguage } from '../i18n/LanguageContext';

// Icons
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

const portals = [
  {
    role: 'user',
    title: 'Public User Portal',
    subtitle: 'For Citizens, Traders & Businesses',
    badge: 'CITIZENS & BUSINESSES',
    description:
      'Register your commercial weighing and measuring instruments, submit online verification applications, track processing status in real time, and download cryptographically signed digital certificates.',
    icon: StorefrontRoundedIcon,
    color: '#D97706', // Refined Amber/Orange
    darkColor: '#B45309',
    lightBg: '#FFFBEB',
    accentBorder: '#FDE68A',
    hoverBorder: '#F59E0B',
    hoverShadow: 'rgba(217, 119, 6, 0.20)',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    features: [
      'Digital Instrument Registration & Dossier',
      'End-to-End Application Tracking',
      'Download Tamper-Proof QR Certificates',
      'Online Fee Payment & Instant E-Challan',
    ],
  },
  {
    role: 'lmo',
    title: 'LMO Officer Portal',
    subtitle: 'Legal Metrology Enforcement Officials',
    badge: 'LEGAL METROLOGY OFFICIALS',
    description:
      'Process verification applications, conduct statutory scrutiny, dispatch field inspectors, manage jurisdictional compliance, and issue tamper-evident digital verification certificates.',
    icon: VerifiedUserRoundedIcon,
    color: '#15803D', // Refined Forest Green
    darkColor: '#166534',
    lightBg: '#F0FDF4',
    accentBorder: '#BBF7D0',
    hoverBorder: '#22C55E',
    hoverShadow: 'rgba(21, 128, 61, 0.20)',
    gradient: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)',
    features: [
      'Automated Scrutiny & Verification Queue',
      'Field Officer Dispatch & Work Allocation',
      'Cryptographic Digital Certificate Stamping',
      'Jurisdictional Compliance & Audit Analytics',
    ],
  },
  {
    role: 'field_officer',
    title: 'Field Officer Portal',
    subtitle: 'On-Ground Verification & Inspection Staff',
    badge: 'FIELD INSPECTORS',
    description:
      'View your assigned on-site inspection schedule, record verification test metrics with geo-tagging, upload calibrated scale photos, and submit verification reports directly from the inspection site.',
    icon: FactCheckRoundedIcon,
    color: '#7E22CE', // Refined Purple
    darkColor: '#6B21A8',
    lightBg: '#FAF5FF',
    accentBorder: '#E9D5FF',
    hoverBorder: '#A855F7',
    hoverShadow: 'rgba(126, 34, 206, 0.20)',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)',
    features: [
      'Daily Geotagged Inspection Schedule',
      'On-Site Verification & Test Logging',
      'Instant Inspection Report Generation',
      'Complete Historical Instrument Audit Log',
    ],
  },
  {
    role: 'gatc',
    title: 'GATC Centre Portal',
    subtitle: 'NABL Accredited Testing & Calibration Labs',
    badge: 'GOVT APPROVED TEST CENTRES',
    description:
      'Manage statutory laboratory testing queues, perform high-precision calibration under Rule 3(1), calculate Maximum Permissible Error (MPE) tolerances, affix tamper-proof security seals, and submit verification reports for Form D endorsement.',
    icon: ScienceRoundedIcon,
    color: '#0D9488', // Refined Teal
    darkColor: '#0F766E',
    lightBg: '#F0FDFA',
    accentBorder: '#99F6E4',
    hoverBorder: '#14B8A6',
    hoverShadow: 'rgba(13, 148, 136, 0.22)',
    gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
    features: [
      'Statutory Laboratory Testing Queue & Batching',
      'Rule 3(1) Calibration & MPE Tolerance Verification',
      'Tamper-Proof GATC Security Seal Management',
      'Official Test Certificate & Report Submission',
    ],
  },
  {
    role: 'admin',
    title: 'Administrator Portal',
    subtitle: 'Central System & Security Administration',
    badge: 'SYSTEM ADMIN',
    description:
      'Manage user accounts and jurisdictional access roles, configure statutory system parameters, monitor real-time platform health, review security audit trails, and oversee national operations.',
    icon: AdminPanelSettingsRoundedIcon,
    color: '#B91C1C', // Refined Crimson Red
    darkColor: '#991B1B',
    lightBg: '#FEF2F2',
    accentBorder: '#FECACA',
    hoverBorder: '#EF4444',
    hoverShadow: 'rgba(185, 28, 28, 0.20)',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
    features: [
      'Role-Based Access & User Provisioning',
      'National Analytics & Real-Time Dashboards',
      'Tamper-Evident Security & Audit Logs',
      'Master Registry & Platform Configuration',
    ],
  },
];

function PortalCard({ portal, navigate }) {
  const { t } = useLanguage();
  const [hovered, setHovered] = useState(false);
  const Icon = portal.icon;

  const handleClick = () => {
    navigate(`/login?role=${portal.role}`);
  };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      sx={{
        cursor: 'pointer',
        bgcolor: '#FFFFFF',
        borderRadius: '20px',
        p: { xs: 3, sm: 3.5, md: 4 },
        minHeight: { xs: 'auto', md: 360 },
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        border: `1.5px solid ${hovered ? portal.hoverBorder : '#E2E8F0'}`,
        boxShadow: hovered
          ? `0 20px 32px -10px ${portal.hoverShadow}, 0 4px 12px -2px rgba(15, 23, 42, 0.08)`
          : '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:focus-visible': {
          outline: `3px solid ${portal.color}`,
          outlineOffset: '2px',
        },
      }}
    >
      {/* Top subtle accent line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: portal.gradient,
        }}
      />

      {/* Top Header Row: Badge & Icon */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
        {/* Role Badge */}
        <Chip
          label={t(portal.badge)}
          size="small"
          sx={{
            bgcolor: portal.lightBg,
            color: portal.darkColor,
            fontWeight: 700,
            fontSize: '0.68rem',
            letterSpacing: '0.04em',
            border: `1px solid ${portal.accentBorder}`,
            borderRadius: '6px',
            py: 0.5,
          }}
        />

        {/* Circular Icon Container */}
        <Box
          sx={{
            width: { xs: 52, sm: 58 },
            height: { xs: 52, sm: 58 },
            borderRadius: '16px',
            background: portal.lightBg,
            border: `1px solid ${portal.accentBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: portal.color,
            transition: 'all 0.25s ease',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            boxShadow: hovered ? `0 8px 16px ${portal.hoverShadow}` : 'none',
          }}
        >
          <Icon sx={{ fontSize: { xs: 28, sm: 32 } }} />
        </Box>
      </Box>

      {/* Portal Name & Role Subtitle */}
      <Typography
        variant="h5"
        component="h3"
        sx={{
          fontWeight: 800,
          color: '#0F172A',
          mb: 0.5,
          fontSize: { xs: '1.25rem', sm: '1.35rem' },
          lineHeight: 1.3,
        }}
      >
        {t(portal.title)}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: portal.darkColor,
          fontWeight: 600,
          mb: 2,
          fontSize: '0.85rem',
        }}
      >
        {t(portal.subtitle)}
      </Typography>

      {/* Portal Description */}
      <Typography
        variant="body2"
        sx={{
          color: '#475569',
          lineHeight: 1.65,
          mb: 3,
          fontSize: '0.92rem',
          flex: 1,
        }}
      >
        {t(portal.description)}
      </Typography>

      {/* Capabilities / Key Features */}
      <Box
        sx={{
          mb: 3.5,
          pt: 2,
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.2,
        }}
      >
        {portal.features.map((feature) => (
          <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <CheckCircleRoundedIcon
              sx={{
                fontSize: 18,
                color: portal.color,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: '#334155',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              {t(feature)}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Full-width CTA Button */}
      <Button
        variant="contained"
        fullWidth
        endIcon={
          <ArrowForwardRoundedIcon
            sx={{
              transition: 'transform 0.25s ease',
              transform: hovered ? 'translateX(5px)' : 'none',
              fontSize: '1.1rem !important',
            }}
          />
        }
        sx={{
          background: portal.gradient,
          color: '#FFFFFF',
          py: 1.6,
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '0.95rem',
          letterSpacing: '0.02em',
          textTransform: 'none',
          boxShadow: `0 4px 14px ${portal.hoverShadow}`,
          '&:hover': {
            background: portal.gradient,
            filter: 'brightness(0.95)',
          },
        }}
      >
        {t('Access ' + portal.title.replace(' Portal', ''))}
      </Button>
    </Box>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, language, setLanguage, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchCert, setSearchCert] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [copiedCert, setCopiedCert] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const validateCertificateQuery = useCallback(async (queryText) => {
    if (!queryText || !queryText.trim()) {
      setVerifyError('Please enter a valid Certificate ID, Serial Number, or scan a QR code.');
      return;
    }

    let cleanQuery = queryText.trim();
    // If input is a URL or QR code text with certId parameter
    try {
      if (cleanQuery.includes('://') || cleanQuery.includes('?') || cleanQuery.includes('#')) {
        if (cleanQuery.includes('#')) {
          const hashPart = cleanQuery.split('#')[1] || '';
          if (hashPart.includes('?')) {
            const hashParams = new URLSearchParams(hashPart.split('?')[1]);
            const certFromHash = hashParams.get('certId') || hashParams.get('cert') || hashParams.get('id');
            if (certFromHash) cleanQuery = certFromHash;
          }
        }
        if (cleanQuery.includes('?')) {
          const urlParams = new URLSearchParams(cleanQuery.split('?')[1]);
          const certFromUrl = urlParams.get('certId') || urlParams.get('cert') || urlParams.get('id');
          if (certFromUrl) cleanQuery = certFromUrl;
        }
      }
    } catch {}

    setVerifying(true);
    setVerifyError('');
    setVerifyNotice('');
    try {
      const res = await authFetch('/api/auth/validate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanQuery }),
      });
      const data = await res.json();
      if (res.ok && data.valid && data.certificate) {
        setVerifyResult(data.certificate);
        setSearchCert(data.certificate.certificateNo || cleanQuery);
      } else {
        setVerifyError(data.error || `No statutory certificate found matching "${cleanQuery.slice(0, 45)}". Please verify your entry.`);
      }
    } catch (err) {
      console.error('Validation request failed:', err);
      setVerifyError('Unable to connect to the National Legal Metrology Registry. Please verify your connection and try again.');
    } finally {
      setVerifying(false);
    }
  }, []);

  const scanVideoFrame = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (code && code.data && code.data.trim()) {
          setScannerOpen(false);
          stopCamera();
          validateCertificateQuery(code.data.trim());
          return;
        }
      }
    }
    animFrameRef.current = requestAnimationFrame(scanVideoFrame);
  }, [stopCamera, validateCertificateQuery]);

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Live camera streaming is not supported on this browser. Please use the image upload option.');
      }
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
      } catch (e) {
        // Fallback to any camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().catch(() => {});
        animFrameRef.current = requestAnimationFrame(scanVideoFrame);
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera access was denied or is unavailable. Please grant camera permission or use the "Upload QR Image" option.');
    }
  }, [scanVideoFrame]);

  useEffect(() => {
    if (scannerOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scannerOpen, startCamera, stopCamera]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVerifyError('');
    setVerifying(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (code && code.data && code.data.trim()) {
            validateCertificateQuery(code.data.trim());
          } else {
            setVerifying(false);
            setVerifyError('No QR code detected in the uploaded image. Please ensure the QR code on the certificate is sharp, well-lit, and in frame, or type the Certificate ID manually.');
          }
        } catch (err) {
          console.error('File scan error:', err);
          setVerifying(false);
          setVerifyError('Could not process the uploaded image. Please try another image file or enter the Certificate ID.');
        }
      };
      img.onerror = () => {
        setVerifying(false);
        setVerifyError('Failed to load image file. Please try again.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleVerify = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchCert.trim()) {
      setVerifyError('Please enter a valid Certificate ID (e.g. CERT-DL-2026-12BC) or scan a QR code.');
      return;
    }
    validateCertificateQuery(searchCert.trim());
  };

  const handleCopyCertificateNo = (certNo) => {
    if (!certNo) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(certNo);
    }
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  const formatDate = (val) => {
    if (!val) return 'N/A';
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(val);
    }
  };

  const navLinks = [
    { label: 'Portals', href: '#portals' },
    { label: 'Key Features', href: '#features' },
    { label: 'Verify Certificate', href: '#verify' },
    { label: 'Statistics', href: '#stats' },
    { label: 'Legal & Guidelines', href: '#legal' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>

      {/* ── 1. OFFICIAL GOVERNMENT OF INDIA TOP STRIP ── */}
      <Box
        sx={{
          bgcolor: '#06162D',
          color: '#CBD5E1',
          py: 0.8,
          px: { xs: 2, sm: 3, md: 4 },
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.78rem',
        }}
      >
        <Box
          sx={{
            maxWidth: 1240,
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Indian Flag subtle representation */}
            <Box
              sx={{
                display: 'inline-flex',
                height: 12,
                width: 18,
                borderRadius: '2px',
                overflow: 'hidden',
                flexDirection: 'column',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <Box sx={{ flex: 1, bgcolor: '#FF9933' }} />
              <Box sx={{ flex: 1, bgcolor: '#FFFFFF' }} />
              <Box sx={{ flex: 1, bgcolor: '#128807' }} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#E2E8F0', letterSpacing: '0.02em' }}>
              भारत सरकार &nbsp;|&nbsp; Government of India
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'block' }, color: 'rgba(255,255,255,0.2)' }}>|</Box>
            <Typography variant="caption" sx={{ display: { xs: 'none', md: 'inline' }, color: '#94A3B8' }}>
              {t('Ministry of Consumer Affairs, Food & Public Distribution')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, color: '#94A3B8' }}>
              <PhoneInTalkRoundedIcon sx={{ fontSize: 13, color: '#F59E0B' }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {t('Toll Free:')} <strong>1800-11-4000</strong>
              </Typography>
            </Box>
            <Typography
              variant="caption"
              onClick={toggleLanguage}
              data-no-translate="true"
              translate="no"
              id="language-toggle-btn"
              title={language === 'en' ? 'हिन्दी में देखें' : 'Switch to English'}
              sx={{
                bgcolor: 'rgba(255,255,255,0.08)',
                px: 1,
                py: 0.25,
                borderRadius: '4px',
                color: '#E2E8F0',
                fontWeight: 600,
                fontSize: '0.72rem',
                cursor: 'pointer',
                userSelect: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.16)',
                },
              }}
            >
              <Box
                component="span"
                onClick={(e) => {
                  e.stopPropagation();
                  setLanguage('en');
                }}
                sx={{
                  color: language === 'en' ? '#FFFFFF' : '#94A3B8',
                  fontWeight: language === 'en' ? 700 : 500,
                  cursor: 'pointer',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                English
              </Box>
              &nbsp;|&nbsp;
              <Box
                component="span"
                onClick={(e) => {
                  e.stopPropagation();
                  setLanguage('hi');
                }}
                sx={{
                  color: language === 'hi' ? '#FFFFFF' : '#94A3B8',
                  fontWeight: language === 'hi' ? 700 : 500,
                  cursor: 'pointer',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                हिन्दी
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── 2. STICKY PROFESSIONAL HEADER / NAVBAR ── */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.05)',
        }}
      >
        <Box
          sx={{
            maxWidth: 1240,
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo & Authority Label */}
          <Box
            component="a"
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.75,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            {/* National Emblem Badge Icon */}
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#0F2B4E',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(15, 43, 78, 0.2)',
                flexShrink: 0,
              }}
            >
              <AccountBalanceRoundedIcon sx={{ fontSize: 26 }} />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    color: '#0F172A',
                    fontSize: { xs: '1rem', sm: '1.15rem' },
                    lineHeight: 1.15,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {t('Legal Metrology Verification System')}
                </Typography>
                <Chip
                  label="SIH 2026"
                  size="small"
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 20,
                    display: { xs: 'none', sm: 'inline-flex' },
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748B',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  display: 'block',
                  lineHeight: 1.3,
                }}
              >
                {t('Department of Consumer Affairs • Legal Metrology Division')}
              </Typography>
            </Box>
          </Box>

          {/* Center Navigation Links (Desktop) */}
          <Box
            component="nav"
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 3,
            }}
          >
            {navLinks.map((item) => (
              <Box
                key={item.label}
                component="a"
                href={item.href}
                sx={{
                  color: '#475569',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: '#0284C7',
                  },
                }}
              >
                {t(item.label)}
              </Box>
            ))}
          </Box>

          {/* Right Action: Sign In CTA & Mobile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '1rem !important' }} />}
              sx={{
                bgcolor: '#0F2B4E',
                color: '#FFFFFF',
                borderRadius: '10px',
                px: 2.5,
                py: 1,
                fontSize: '0.88rem',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(15, 43, 78, 0.25)',
                '&:hover': {
                  bgcolor: '#1E3A8A',
                },
              }}
            >
              {t('Sign In')}
            </Button>

            {/* Mobile Menu Button */}
            <IconButton
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: '#0F172A',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                p: 0.9,
              }}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Mobile Drawer Navigation */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: { width: 280, bgcolor: '#FFFFFF', p: 2.5 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
            {t('Navigation')}
          </Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List>
          {navLinks.map((item) => (
            <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component="a"
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                sx={{ borderRadius: '8px' }}
              >
                <ListItemText
                  primary={t(item.label)}
                  primaryTypographyProps={{ fontWeight: 600, color: '#334155' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
              sx={{
                bgcolor: '#0F2B4E',
                py: 1.25,
                borderRadius: '10px',
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              {t('Access Portal / Login')}
            </Button>
          </ListItem>
        </List>
      </Drawer>

      {/* ── 3. HERO SECTION ── */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #06182E 0%, #0B2B4E 40%, #0F3B6C 75%, #0A223E 100%)',
          color: '#FFFFFF',
          pt: { xs: 5, md: 7 },
          pb: { xs: 6, md: 8 },
        }}
      >
        {/* Subtle technical background grid & radial glow */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 25%, rgba(56, 189, 248, 0.14) 0%, transparent 45%),
              radial-gradient(circle at 80% 75%, rgba(129, 140, 248, 0.12) 0%, transparent 50%),
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
            pointerEvents: 'none',
          }}
        />

        {/* Decorative concentric rings */}
        <Box
          sx={{
            position: 'absolute',
            width: 700,
            height: 700,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.04)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 480,
            height: 480,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ maxWidth: 1240, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, position: 'relative', textAlign: 'center' }}>
          {/* Eyebrow Chip */}
          <Chip
            label={t('🇮🇳  National Single Window • Digital India Initiative')}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: { xs: '0.75rem', sm: '0.82rem' },
              mb: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(8px)',
              py: 0.5,
              px: 1,
            }}
          />

          {/* Main Headline */}
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.9rem', sm: '2.6rem', md: '3.1rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              mb: 2,
              maxWidth: 960,
              mx: 'auto',
            }}
          >
            {t('Online Verification & Certification Platform')}
          </Typography>

          {/* Supporting Description */}
          <Typography
            variant="body1"
            sx={{
              color: '#E2E8F0',
              fontWeight: 400,
              maxWidth: 780,
              mx: 'auto',
              lineHeight: 1.75,
              fontSize: { xs: '0.98rem', sm: '1.1rem' },
              mb: 4,
            }}
          >
            {t('A unified national digital architecture for weighing and measuring instrument verification, cryptographic stamping, field inspection compliance, and lifecycle certification under the')}{' '}
            <strong style={{ color: '#FCD34D' }}>{t('Legal Metrology Act, 2009')}</strong>.
          </Typography>

          {/* Trust Highlights Strip */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: { xs: 1.5, sm: 2.5 },
              maxWidth: 900,
              mx: 'auto',
            }}
          >
            {[
              { icon: <ShieldRoundedIcon sx={{ fontSize: 18, color: '#38BDF8' }} />, text: t('Tamper-Proof QR Stamping') },
              { icon: <GavelRoundedIcon sx={{ fontSize: 18, color: '#FCD34D' }} />, text: t('Statutory LM Act Compliance') },
              { icon: <SpeedRoundedIcon sx={{ fontSize: 18, color: '#4ADE80' }} />, text: t('Real-Time Verification Tracking') },
              { icon: <PublicRoundedIcon sx={{ fontSize: 18, color: '#C084FC' }} />, text: t('Nationwide Interoperable Portal') },
            ].map((badge, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '999px',
                  px: 2,
                  py: 0.75,
                  backdropFilter: 'blur(6px)',
                }}
              >
                {badge.icon}
                <Typography variant="caption" sx={{ color: '#F1F5F9', fontWeight: 600, fontSize: '0.8rem' }}>
                  {badge.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── 4. OFFICIAL NOTICE / TICKER BANNER ── */}
      <Box
        sx={{
          bgcolor: '#FFFBEB',
          borderBottom: '1px solid #FDE68A',
          py: 1.25,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            maxWidth: 1240,
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={t('IMPORTANT NOTICE')}
              size="small"
              sx={{
                bgcolor: '#D97706',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.65rem',
                borderRadius: '4px',
                height: 22,
              }}
            />
            <Typography variant="body2" sx={{ color: '#78350F', fontWeight: 600, fontSize: '0.86rem' }}>
              {t('Periodic verification & electronic re-stamping for all commercial measuring instruments is mandatory. Verify your certificate authenticity online.')}
            </Typography>
          </Box>
          <Box
            component="a"
            href="#verify"
            sx={{
              color: '#B45309',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {t('Verify Certificate Now')} <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
          </Box>
        </Box>
      </Box>

      {/* ── 5. "CHOOSE YOUR PORTAL" SECTION (2x2 GRID DESKTOP) ── */}
      <Box
        id="portals"
        component="section"
        sx={{
          py: { xs: 6, md: 9 },
          px: { xs: 2, sm: 3, md: 4 },
          bgcolor: '#F8FAFC',
          flex: 1,
        }}
      >
        <Box sx={{ maxWidth: 1240, mx: 'auto' }}>
          {/* Section Header */}
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
            <Typography
              variant="overline"
              sx={{
                color: '#0284C7',
                fontWeight: 800,
                letterSpacing: '0.12em',
                fontSize: '0.82rem',
                display: 'block',
                mb: 0.5,
              }}
            >
              {t('SECURE PORTAL SELECTION')}
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 900,
                color: '#0F172A',
                fontSize: { xs: '1.85rem', sm: '2.3rem', md: '2.6rem' },
                letterSpacing: '-0.02em',
                mb: 1.5,
              }}
            >
              {t('Choose Your Designated Portal')}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#64748B',
                maxWidth: 680,
                mx: 'auto',
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                lineHeight: 1.65,
              }}
            >
              {t('Select the operational portal matching your statutory role to access role-tailored dashboards, verification queues, laboratory testing modules, and certification workflows.')}
            </Typography>
          </Box>

          {/* Responsive 5-Portal Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(6, 1fr)',
              },
              gap: { xs: 3, sm: 3.5, md: 4 },
              maxWidth: 1240,
              mx: 'auto',
            }}
          >
            {portals.map((portal, index) => {
              // 6-column grid on desktop (lg):
              // Row 1 (first 3 cards: User, LMO, Field Officer) each take span 2 (2+2+2 = 6)
              // Row 2 (cards 4 & 5: GATC, Admin) each take span 2, with Card 4 starting at col 2 (centered!)
              let gridCol = { xs: 'span 1' };
              if (index < 3) {
                gridCol = {
                  xs: 'span 1',
                  sm: 'span 1',
                  lg: 'span 2',
                };
              } else if (index === 3) {
                gridCol = {
                  xs: 'span 1',
                  sm: 'span 1',
                  lg: '2 / span 2',
                };
              } else if (index === 4) {
                gridCol = {
                  xs: 'span 1',
                  sm: 'span 2',
                  lg: 'span 2',
                };
              }

              return (
                <Box
                  key={portal.role}
                  sx={{
                    gridColumn: gridCol,
                    display: 'flex',
                    ...(index === 4
                      ? {
                          maxWidth: { sm: 580, lg: 'none' },
                          mx: { sm: 'auto', lg: 0 },
                          width: '100%',
                        }
                      : { width: '100%' }),
                  }}
                >
                  <PortalCard portal={portal} navigate={navigate} />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* ── 6. INSTANT CERTIFICATE VERIFICATION STRIP ── */}
      <Box
        id="verify"
        component="section"
        sx={{
          bgcolor: '#FFFFFF',
          py: { xs: 6, md: 8 },
          px: { xs: 2, sm: 3, md: 4 },
          borderTop: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Box
          sx={{
            maxWidth: 1080,
            mx: 'auto',
            bgcolor: '#F8FAFC',
            borderRadius: '24px',
            p: { xs: 3, sm: 5 },
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 8px 24px -6px rgba(15, 23, 42, 0.05)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Chip
              icon={<QrCodeScannerRoundedIcon sx={{ fontSize: '1rem !important' }} />}
              label={t('PUBLIC REPOSITORIES & AUDIT')}
              size="small"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 700,
                fontSize: '0.7rem',
                mb: 1.5,
                border: '1px solid #BFDBFE',
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.4rem', sm: '1.75rem' }, mb: 1 }}>
              {t('Verify Stamping Certificate & Instrument Details')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, fontSize: '0.92rem', mb: 2.5 }}>
              {t('Scan the official QR code on any Legal Metrology certificate or weighing/measuring instrument to authenticate statutory stamping, validity dates, accuracy class, security seal, and full technical specifications.')}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleRoundedIcon sx={{ color: '#16A34A', fontSize: '1.1rem' }} />
                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
                  {t('Real-time synchronization with National Legal Metrology Database')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleRoundedIcon sx={{ color: '#16A34A', fontSize: '1.1rem' }} />
                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
                  {t('Statutory verification of lead seal, inspector credentials & MPE tolerance')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleRoundedIcon sx={{ color: '#16A34A', fontSize: '1.1rem' }} />
                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
                  {t('Instant digital signature audit under Legal Metrology Act, 2009')}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Verification Controls */}
          <Box sx={{ width: { xs: '100%', md: '480px' } }}>
            {/* Hidden canvas and file input */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            {/* Quick Scan Action Buttons */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
              <Button
                variant="contained"
                onClick={() => setScannerOpen(true)}
                startIcon={<CameraAltRoundedIcon />}
                sx={{
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  py: 1.3,
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
                  '&:hover': { bgcolor: '#0369A1' },
                }}
              >
                {t('Scan with Camera')}
              </Button>

              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<CloudUploadRoundedIcon />}
                sx={{
                  color: '#0284C7',
                  borderColor: '#BAE6FD',
                  bgcolor: '#F0F9FF',
                  py: 1.3,
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#0284C7',
                    bgcolor: '#E0F2FE',
                  },
                }}
              >
                {t('Upload QR Image')}
              </Button>
            </Box>

            <Divider sx={{ my: 2, fontSize: '0.72rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>
              {t('OR SEARCH BY CERTIFICATE / SERIAL NO.')}
            </Divider>

            <Box component="form" onSubmit={handleVerify} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                fullWidth
                size="medium"
                value={searchCert}
                onChange={(e) => setSearchCert(e.target.value)}
                placeholder={t('e.g. CERT-DL-2026-12BC or cefc')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: '#64748B' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: '#FFFFFF',
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={verifying}
                  sx={{
                    flex: 1,
                    bgcolor: '#0F172A',
                    color: '#FFFFFF',
                    py: 1.3,
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#1E293B' },
                  }}
                >
                  {verifying ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={18} color="inherit" />
                      <span>{t('Validating with Registry...')}</span>
                    </Box>
                  ) : (
                    t('Validate Certificate')
                  )}
                </Button>
              </Box>

              {/* Quick Demo Test Chip */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  {t('Test with Active Certificate:')}
                </Typography>
                <Chip
                  label="CERT-DL-2026-12BC"
                  size="small"
                  onClick={() => {
                    setSearchCert('CERT-DL-2026-12BC');
                    validateCertificateQuery('CERT-DL-2026-12BC');
                  }}
                  clickable
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    bgcolor: '#E0F2FE',
                    color: '#0369A1',
                    border: '1px solid #7DD3FC',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#BAE6FD' },
                  }}
                />
              </Box>
            </Box>

            {/* Error Message */}
            {verifyError && (
              <Alert
                severity="error"
                sx={{ mt: 2, borderRadius: '12px', fontSize: '0.85rem' }}
                onClose={() => setVerifyError('')}
              >
                {verifyError}
              </Alert>
            )}

            {/* Notice */}
            {verifyNotice && !verifyError && (
              <Alert severity="success" sx={{ mt: 2, borderRadius: '12px', fontSize: '0.85rem' }}>
                {verifyNotice}
              </Alert>
            )}
          </Box>
        </Box>

        {/* ── LIVE CAMERA QR SCANNER DIALOG ── */}
        <Dialog
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#0B1120',
              color: '#F8FAFC',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden',
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <QrCodeScannerRoundedIcon sx={{ color: '#38BDF8' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFFFFF' }}>
                Scan Certificate QR Code
              </Typography>
            </Box>
            <IconButton onClick={() => setScannerOpen(false)} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {cameraError ? (
              <Alert
                severity="warning"
                sx={{ width: '100%', mb: 2, borderRadius: '12px' }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setScannerOpen(false);
                      fileInputRef.current?.click();
                    }}
                  >
                    Upload Image
                  </Button>
                }
              >
                {cameraError}
              </Alert>
            ) : (
              <Typography variant="body2" sx={{ color: '#94A3B8', textAlign: 'center', mb: 2, fontSize: '0.85rem' }}>
                Hold the certificate steady and position the QR code within the highlighted viewfinder frame.
              </Typography>
            )}

            {/* Video Viewfinder Container */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 360,
                height: 320,
                borderRadius: '16px',
                overflow: 'hidden',
                bgcolor: '#020617',
                border: '2px solid rgba(56, 189, 248, 0.4)',
                boxShadow: '0 0 30px rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Viewfinder Target Box Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  width: 220,
                  height: 220,
                  borderRadius: '14px',
                  border: '2px dashed rgba(34, 197, 94, 0.85)',
                  boxShadow: '0 0 0 9999px rgba(11, 17, 32, 0.65)',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />

              {/* Animated Laser Scanning Line */}
              <Box
                sx={{
                  position: 'absolute',
                  width: 220,
                  height: '3px',
                  bgcolor: '#22C55E',
                  boxShadow: '0 0 12px 3px rgba(34, 197, 94, 0.9)',
                  pointerEvents: 'none',
                  zIndex: 3,
                  animation: 'scanLaser 2.4s ease-in-out infinite',
                  '@keyframes scanLaser': {
                    '0%': { transform: 'translateY(-100px)', opacity: 0.7 },
                    '50%': { transform: 'translateY(100px)', opacity: 1 },
                    '100%': { transform: 'translateY(-100px)', opacity: 0.7 },
                  },
                }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)', justifyContent: 'space-between' }}>
            <Button
              onClick={() => {
                setScannerOpen(false);
                fileInputRef.current?.click();
              }}
              startIcon={<CloudUploadRoundedIcon />}
              sx={{ color: '#38BDF8', textTransform: 'none', fontWeight: 600 }}
            >
              Upload QR Image File
            </Button>
            <Button
              onClick={() => setScannerOpen(false)}
              variant="outlined"
              sx={{ color: '#94A3B8', borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none' }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── OFFICIAL VERIFIED CERTIFICATE DOSSIER DIALOG ── */}
        <Dialog
          open={Boolean(verifyResult)}
          onClose={() => setVerifyResult(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              border: '1px solid #E2E8F0',
            },
          }}
        >
          {verifyResult && (
            <>
              {/* Official Tricolor Ribbon */}
              <Box sx={{ display: 'flex', height: 6, width: '100%' }}>
                <Box sx={{ flex: 1, bgcolor: '#FF9933' }} />
                <Box sx={{ flex: 1, bgcolor: '#FFFFFF' }} />
                <Box sx={{ flex: 1, bgcolor: '#138808' }} />
              </Box>

              {/* Official Header */}
              <Box
                sx={{
                  bgcolor: '#0B1528',
                  color: '#FFFFFF',
                  px: { xs: 2.5, sm: 4 },
                  py: 3,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AccountBalanceRoundedIcon sx={{ fontSize: '1.8rem', color: '#F8FAFC' }} />
                  </Box>
                  <Box>
                    <Typography variant="overline" sx={{ color: '#93C5FD', fontWeight: 800, letterSpacing: '0.08em', fontSize: '0.68rem', display: 'block' }}>
                      GOVERNMENT OF INDIA • DIRECTORATE OF LEGAL METROLOGY
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
                      Statutory Verification Audit Dossier
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#CBD5E1', fontSize: '0.75rem' }}>
                      Issued under Section 24, Legal Metrology Act, 2009 & Legal Metrology (General) Rules, 2011
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setVerifyResult(null)} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
                  <CloseRoundedIcon />
                </IconButton>
              </Box>

              <DialogContent sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: '#F8FAFC' }}>
                {/* Verified Status Banner */}
                <Box
                  sx={{
                    mb: 3,
                    p: 2.5,
                    borderRadius: '16px',
                    bgcolor: verifyResult.isValid ? '#F0FDF4' : '#FEF2F2',
                    border: `1.5px solid ${verifyResult.isValid ? '#86EFAC' : '#FCA5A5'}`,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        bgcolor: verifyResult.isValid ? '#DCFCE7' : '#FEE2E2',
                        color: verifyResult.isValid ? '#16A34A' : '#DC2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {verifyResult.isValid ? <VerifiedRoundedIcon sx={{ fontSize: '1.8rem' }} /> : <ErrorOutlineRoundedIcon sx={{ fontSize: '1.8rem' }} />}
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: verifyResult.isValid ? '#166534' : '#991B1B' }}>
                          {verifyResult.status || (verifyResult.isValid ? 'STATUTORILY AUTHENTIC & VALID' : 'EXPIRED')}
                        </Typography>
                        <Chip
                          label={verifyResult.isValid ? 'ACTIVE' : 'EXPIRED'}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            bgcolor: verifyResult.isValid ? '#16A34A' : '#DC2626',
                            color: '#FFFFFF',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                        Valid Until: <strong>{formatDate(verifyResult.validUntil)}</strong> {verifyResult.daysRemaining ? `(${verifyResult.daysRemaining} days remaining)` : ''}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Certificate ID Pill with Copy */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      bgcolor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      CERT NO:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                      {verifyResult.certificateNo}
                    </Typography>
                    <Tooltip title={copiedCert ? t('Copied!') : t('Copy Certificate Number')}>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyCertificateNo(verifyResult.certificateNo)}
                        sx={{ color: copiedCert ? '#16A34A' : '#64748B', p: 0.5 }}
                      >
                        {copiedCert ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* 2x2 Detailed Audit Cards */}
                <Grid container spacing={2.5}>
                  {/* Card 1: Instrument Technical Specifications */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        bgcolor: '#FFFFFF',
                        height: '100%',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2, pb: 1, borderBottom: '1px solid #F1F5F9' }}>
                        <PrecisionManufacturingRoundedIcon sx={{ color: '#0284C7', fontSize: '1.3rem' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '0.02em' }}>
                          Instrument Technical Specifications
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, fontSize: '0.85rem' }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Instrument Type
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {verifyResult.instrument?.type || 'Standard Weighing Instrument'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Serial Number
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                            {verifyResult.instrument?.serialNo || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Make & Model
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                            {verifyResult.instrument?.make || 'Standard'} / {verifyResult.instrument?.model || 'Commercial'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Maximum Capacity
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                            {verifyResult.instrument?.capacity || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ gridColumn: 'span 2' }}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Accuracy Classification
                          </Typography>
                          <Chip
                            label={verifyResult.instrument?.accuracyClass || 'Class III (Medium Accuracy)'}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#F1F5F9', color: '#1E293B', mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Card 2: Legal Metrology Stamping & Seal */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        bgcolor: '#FFFFFF',
                        height: '100%',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2, pb: 1, borderBottom: '1px solid #F1F5F9' }}>
                        <LockRoundedIcon sx={{ color: '#16A34A', fontSize: '1.3rem' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '0.02em' }}>
                          Statutory Stamping & Inspection
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, fontSize: '0.85rem' }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Security Lead Seal No.
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#166534', fontFamily: 'monospace' }}>
                            {verifyResult.securitySealNo || 'SEAL-AUTHENTIC'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Statutory Inspection Result
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                            <TaskAltRoundedIcon sx={{ color: '#16A34A', fontSize: '1rem' }} />
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#16A34A' }}>
                              {verifyResult.verificationMetrics?.inspectionResult || 'PASS (Compliant)'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ gridColumn: 'span 2' }}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Authorized Stamping Officer
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {verifyResult.stampedBy || 'State Metrology Inspector'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Verification Date
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                            {formatDate(verifyResult.issueDate)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Permissible Error MPE
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                            {verifyResult.verificationMetrics?.testErrorPercentage || 'Within +/- 0.05%'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Card 3: Establishment & Trader Profile */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        bgcolor: '#FFFFFF',
                        height: '100%',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2, pb: 1, borderBottom: '1px solid #F1F5F9' }}>
                        <BusinessRoundedIcon sx={{ color: '#D97706', fontSize: '1.3rem' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '0.02em' }}>
                          Registered Commercial Establishment
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, fontSize: '0.85rem' }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Trade Name / Enterprise
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            {verifyResult.establishment?.businessName || 'Registered Commercial Trader'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Commercial Premise Address
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                            {verifyResult.establishment?.address || 'Registered Business Address'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                              Authorized Signatory
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                              {verifyResult.establishment?.contactPerson || 'Authorized Trader'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                              Trade Category
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                              {verifyResult.establishment?.tradeType || 'Commercial Trade'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Card 4: Cryptographic & Integrity Proof */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        bgcolor: '#FFFFFF',
                        height: '100%',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2, pb: 1, borderBottom: '1px solid #F1F5F9' }}>
                        <ShieldRoundedIcon sx={{ color: '#4F46E5', fontSize: '1.3rem' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '0.02em' }}>
                          Cryptographic Digital Signature Audit
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, fontSize: '0.85rem' }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Issuing Authority
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {verifyResult.digitalSignature?.issuerAuthority || 'State Directorate of Legal Metrology, Government of NCT of Delhi'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Digital Signature Hash
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: '#475569',
                              fontFamily: 'monospace',
                              bgcolor: '#F8FAFC',
                              p: 1,
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              display: 'block',
                              wordBreak: 'break-all',
                            }}
                          >
                            {verifyResult.digitalSignature?.signatureHash || 'ECDSA-SHA256-VERIFIED'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 0.5 }}>
                          <CheckCircleRoundedIcon sx={{ color: '#16A34A', fontSize: '1.1rem' }} />
                          <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700 }}>
                            Digitally sealed & verified against Legal Metrology Registry
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </DialogContent>

              {/* Dialog Actions */}
              <DialogActions sx={{ p: 2.5, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PrintRoundedIcon />}
                    onClick={() => window.print()}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      color: '#0F172A',
                      borderColor: '#CBD5E1',
                      '&:hover': { bgcolor: '#F8FAFC' },
                    }}
                  >
                    Print Verification Dossier
                  </Button>
                  <Button
                    variant="text"
                    startIcon={<RestartAltRoundedIcon />}
                    onClick={() => {
                      setVerifyResult(null);
                      setSearchCert('');
                    }}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, color: '#64748B' }}
                  >
                    Verify Another Certificate
                  </Button>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => setVerifyResult(null)}
                  sx={{
                    bgcolor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    px: 3,
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#1E293B' },
                  }}
                >
                  Close Dossier
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>

      {/* ── 7. KEY CAPABILITIES & FEATURES ── */}
      <Box
        id="features"
        component="section"
        sx={{
          py: { xs: 6, md: 8 },
          px: { xs: 2, sm: 3, md: 4 },
          bgcolor: '#F8FAFC',
        }}
      >
        <Box sx={{ maxWidth: 1240, mx: 'auto' }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="overline" sx={{ color: '#0284C7', fontWeight: 800, letterSpacing: '0.1em' }}>
              SYSTEM ARCHITECTURE
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5, fontSize: { xs: '1.6rem', sm: '2rem' } }}>
              Enterprise Government Metrology Infrastructure
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
            }}
          >
            {[
              {
                icon: <SecurityRoundedIcon sx={{ fontSize: 32, color: '#0284C7' }} />,
                title: 'Tamper-Proof QR Security',
                desc: 'Digital certificates with cryptographic SHA-256 signatures preventing certificate forgery and counterfeit seals.',
              },
              {
                icon: <FactCheckRoundedIcon sx={{ fontSize: 32, color: '#16A34A' }} />,
                title: 'Geo-Tagged Inspections',
                desc: 'Field verification reports recorded with exact GPS coordinates and calibrated instrument scale photographic evidence.',
              },
              {
                icon: <SpeedRoundedIcon sx={{ fontSize: 32, color: '#D97706' }} />,
                title: 'SLA-Driven Processing',
                desc: 'Automated statutory timelines ensuring swift verification of applications with zero administrative red tape.',
              },
              {
                icon: <AccountBalanceRoundedIcon sx={{ fontSize: 32, color: '#7E22CE' }} />,
                title: 'National Standards Aligned',
                desc: '100% compliant with the standards set forth by the Legal Metrology (General) Rules, 2011 and OIML recommendations.',
              },
            ].map((feature, i) => (
              <Box
                key={i}
                sx={{
                  bgcolor: '#FFFFFF',
                  borderRadius: '16px',
                  p: 3,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '12px',
                    bgcolor: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, fontSize: '0.88rem' }}>
                  {feature.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── 8. REDESIGNED STATS SECTION (EQUAL 4-COLUMN CARDS) ── */}
      <Box
        id="stats"
        component="section"
        sx={{
          bgcolor: '#FFFFFF',
          py: { xs: 6, md: 8 },
          px: { xs: 2, sm: 3, md: 4 },
          borderTop: '1px solid #E2E8F0',
        }}
      >
        <Box sx={{ maxWidth: 1240, mx: 'auto' }}>
          {/* Card Container for Stats */}
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.06)',
              p: { xs: 3, sm: 4, md: 5 },
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: { xs: 3, md: 0 },
              }}
            >
              {[
                {
                  value: '15L+',
                  label: 'Instruments Registered',
                  detail: 'Commercial scales, petrol dispensers & flow meters',
                  color: '#0284C7',
                },
                {
                  value: '2,800+',
                  label: 'LMO Officers',
                  detail: 'Active jurisdictional inspectors & officers',
                  color: '#16A34A',
                },
                {
                  value: '28',
                  label: 'States & UTs Covered',
                  detail: 'Unified single-window national footprint',
                  color: '#7E22CE',
                },
                {
                  value: '99.9%',
                  label: 'Platform Availability SLA',
                  detail: 'High availability cloud infrastructure uptime',
                  color: '#D97706',
                },
              ].map((stat, i) => (
                <Box
                  key={i}
                  sx={{
                    textAlign: 'center',
                    px: { xs: 1, md: 3 },
                    py: { xs: 1.5, md: 1 },
                    borderRight: {
                      xs: 'none',
                      md: i < 3 ? '1px solid #E2E8F0' : 'none',
                    },
                    borderBottom: {
                      xs: i < 3 ? '1px solid #F1F5F9' : 'none',
                      sm: i < 2 ? '1px solid #F1F5F9' : 'none',
                      md: 'none',
                    },
                    pb: { xs: 2.5, sm: 2.5, md: 1 },
                  }}
                >
                  <Typography
                    variant="h2"
                    component="div"
                    sx={{
                      fontWeight: 900,
                      color: stat.color,
                      fontSize: { xs: '2.2rem', sm: '2.6rem', md: '3rem' },
                      lineHeight: 1.1,
                      mb: 0.5,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: '#0F172A',
                      fontWeight: 700,
                      fontSize: '1rem',
                      mb: 0.5,
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748B',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      display: 'block',
                      maxWidth: 220,
                      mx: 'auto',
                    }}
                  >
                    {stat.detail}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── 9. NATIONAL GRADE ENTERPRISE FOOTER ── */}
      <Box
        component="footer"
        id="legal"
        sx={{
          bgcolor: '#06162D',
          color: '#E2E8F0',
          pt: { xs: 6, md: 8 },
          pb: 4,
          px: { xs: 2, sm: 3, md: 4 },
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Box sx={{ maxWidth: 1240, mx: 'auto' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' },
              gap: { xs: 4, md: 5 },
              mb: 6,
            }}
          >
            {/* Ministry & Brand Column */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AccountBalanceRoundedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1.1rem' }}>
                  Legal Metrology Verification System
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.7, mb: 2.5, fontSize: '0.88rem', maxWidth: 360 }}>
                An authoritative national digital portal implemented under the Legal Metrology Act, 2009 for standardizing weights, measures, stamping protocols, and consumer protection.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#CBD5E1', fontSize: '0.84rem' }}>
                  <PhoneInTalkRoundedIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                  <span>{t('National Consumer Helpline:')} <strong>1915</strong> | <strong>1800-11-4000</strong></span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#CBD5E1', fontSize: '0.84rem' }}>
                  <EmailRoundedIcon sx={{ fontSize: 16, color: '#38BDF8' }} />
                  <span>support-metrology@gov.in</span>
                </Box>
              </Box>
            </Box>

            {/* Operational Portals Column */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2, letterSpacing: '0.04em' }}>
                ACCESS PORTALS
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {portals.map((p) => (
                  <Box
                    key={p.role}
                    component="a"
                    href={`/login?role=${p.role}`}
                    sx={{
                      color: '#94A3B8',
                      textDecoration: 'none',
                      fontSize: '0.86rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      transition: 'color 0.2s',
                      '&:hover': { color: '#38BDF8' },
                    }}
                  >
                    {t(p.title)} <LaunchRoundedIcon sx={{ fontSize: 12, opacity: 0.6 }} />
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Acts & Compliance Column */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2, letterSpacing: '0.04em' }}>
                ACTS &amp; REGULATIONS
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, fontSize: '0.86rem', color: '#94A3B8' }}>
                <Box component="span">Legal Metrology Act, 2009</Box>
                <Box component="span">LM (General) Rules, 2011</Box>
                <Box component="span">Packaged Commodities Rules</Box>
                <Box component="span">National Physical Laboratory (NPL)</Box>
                <Box component="span">OIML Recommendations</Box>
              </Box>
            </Box>

            {/* SIH Hackathon & Technical Details */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2, letterSpacing: '0.04em' }}>
                SIH INITIATIVE
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.84rem', lineHeight: 1.6, mb: 1.5 }}>
                Developed for Smart India Hackathon 2026.
              </Typography>
              <Chip
                label="Problem ID: SIH26036"
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.08)',
                  color: '#FCD34D',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

          {/* Copyright & Disclaimer Bar */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.78rem' }}>
              © 2026 Legal Metrology Verification System &nbsp;|&nbsp; Ministry of Consumer Affairs, Food &amp; Public Distribution &nbsp;|&nbsp; Government of India
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.78rem' }}>
              Official National Certification Platform • All Rights Reserved
            </Typography>
          </Box>
        </Box>
      </Box>

    </Box>
  );
}
