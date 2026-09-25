import React, { useState } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

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

function PortalCard({ portal }) {
  const [hovered, setHovered] = useState(false);
  const Icon = portal.icon;

  const handleClick = () => {
    window.open(`/login?role=${portal.role}`, '_blank');
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
          label={portal.badge}
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
        {portal.title}
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
        {portal.subtitle}
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
        {portal.description}
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
              {feature}
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
        Access {portal.title.replace(' Portal', '')}
      </Button>
    </Box>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchCert, setSearchCert] = useState('');
  const [verifyNotice, setVerifyNotice] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    if (!searchCert.trim()) {
      setVerifyNotice('Please enter a valid Verification / Certificate ID (e.g., LM-2026-DL-9842)');
      return;
    }
    setVerifyNotice(`Validating Certificate "${searchCert.trim().toUpperCase()}": Digitally Verified & Authentic (Issued under Legal Metrology Act, 2009).`);
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
              Ministry of Consumer Affairs, Food &amp; Public Distribution
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, color: '#94A3B8' }}>
              <PhoneInTalkRoundedIcon sx={{ fontSize: 13, color: '#F59E0B' }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                Toll Free: <strong>1800-11-4000</strong>
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                bgcolor: 'rgba(255,255,255,0.08)',
                px: 1,
                py: 0.25,
                borderRadius: '4px',
                color: '#E2E8F0',
                fontWeight: 600,
                fontSize: '0.72rem',
              }}
            >
              English &nbsp;|&nbsp; हिन्दी
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
                  Legal Metrology Verification System
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
                Department of Consumer Affairs • Legal Metrology Division
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
                {item.label}
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
              Sign In
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
            Navigation
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
                  primary={item.label}
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
              Access Portal / Login
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
            label="🇮🇳  National Single Window • Digital India Initiative"
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
            Online Verification &amp; Certification Platform
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
            A unified national digital architecture for weighing and measuring instrument verification,
            cryptographic stamping, field inspection compliance, and lifecycle certification under the{' '}
            <strong style={{ color: '#FCD34D' }}>Legal Metrology Act, 2009</strong>.
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
              { icon: <ShieldRoundedIcon sx={{ fontSize: 18, color: '#38BDF8' }} />, text: 'Tamper-Proof QR Stamping' },
              { icon: <GavelRoundedIcon sx={{ fontSize: 18, color: '#FCD34D' }} />, text: 'Statutory LM Act Compliance' },
              { icon: <SpeedRoundedIcon sx={{ fontSize: 18, color: '#4ADE80' }} />, text: 'Real-Time Verification Tracking' },
              { icon: <PublicRoundedIcon sx={{ fontSize: 18, color: '#C084FC' }} />, text: 'Nationwide Interoperable Portal' },
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
              label="IMPORTANT NOTICE"
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
              Periodic verification &amp; electronic re-stamping for all commercial measuring instruments is mandatory. Verify your certificate authenticity online.
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
            Verify Certificate Now <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
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
              SECURE PORTAL SELECTION
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
              Choose Your Designated Portal
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
              Select the operational portal matching your role to access role-tailored dashboards,
              inspection queues, and certification workflows.
            </Typography>
          </Box>

          {/* Responsive 2 Columns × 2 Rows Desktop Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
              },
              gap: { xs: 3, sm: 3.5, md: 4 },
              maxWidth: 1200,
              mx: 'auto',
            }}
          >
            {portals.map((portal) => (
              <PortalCard key={portal.role} portal={portal} />
            ))}
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
              label="PUBLIC REPOSITORIES & AUDIT"
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
              Verify Stamping Certificate Authenticity
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Citizens, commercial buyers, and enforcement officers can instantly authenticate any Legal Metrology certificate using the unique serial number or QR hash code.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleVerify} sx={{ width: { xs: '100%', md: '440px' } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                fullWidth
                size="medium"
                value={searchCert}
                onChange={(e) => setSearchCert(e.target.value)}
                placeholder="e.g. LM-2026-DL-8492"
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
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  py: 1.4,
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#0369A1' },
                }}
              >
                Validate Certificate
              </Button>
            </Box>
            {verifyNotice && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: '10px',
                  bgcolor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#15803D',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                {verifyNotice}
              </Box>
            )}
          </Box>
        </Box>
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
                  <span>National Consumer Helpline: <strong>1915</strong> | <strong>1800-11-4000</strong></span>
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
                    target="_blank"
                    rel="noreferrer"
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
                    {p.title} <LaunchRoundedIcon sx={{ fontSize: 12, opacity: 0.6 }} />
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
