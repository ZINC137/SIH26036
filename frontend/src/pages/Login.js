import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Chip,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';

const PORTAL_CONFIG = {
  user: {
    label: 'Public User Portal',
    roleBadge: 'CITIZENS & BUSINESSES',
    icon: StorefrontRoundedIcon,
    color: '#D97706',
    darkColor: '#B45309',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    lightBg: '#FFFBEB',
    accentBorder: '#FDE68A',
    hint: 'Authorized access for instrument owners, commercial traders & manufacturers',
  },
  lmo: {
    label: 'LMO Officer Portal',
    roleBadge: 'LEGAL METROLOGY OFFICIALS',
    icon: VerifiedUserRoundedIcon,
    color: '#15803D',
    darkColor: '#166534',
    gradient: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)',
    lightBg: '#F0FDF4',
    accentBorder: '#BBF7D0',
    hint: 'Restricted access for jurisdictional Legal Metrology Officers & State Regulators',
  },
  field_officer: {
    label: 'Field Officer Portal',
    roleBadge: 'FIELD INSPECTORS',
    icon: FactCheckRoundedIcon,
    color: '#7E22CE',
    darkColor: '#6B21A8',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)',
    lightBg: '#FAF5FF',
    accentBorder: '#E9D5FF',
    hint: 'Official mobile & desktop access for on-ground verification and testing staff',
  },
  admin: {
    label: 'Administrator Portal',
    roleBadge: 'CENTRAL ADMINISTRATION',
    icon: AdminPanelSettingsRoundedIcon,
    color: '#B91C1C',
    darkColor: '#991B1B',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
    lightBg: '#FEF2F2',
    accentBorder: '#FECACA',
    hint: 'Tier-1 secure clearance for national system controllers & compliance directors',
  },
};

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') || 'user';
  const portal = PORTAL_CONFIG[roleFromUrl] || PORTAL_CONFIG.user;
  const PortalIcon = portal.icon;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fillDemoCredentials = () => {
    setEmail('admin@example.com');
    setPassword('AdminPassword123!');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both your official email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(roleFromUrl, data.user?.email || email);
        navigate(
          roleFromUrl === 'lmo'
            ? '/dashboard/lmo'
            : roleFromUrl === 'field_officer'
            ? '/dashboard/field-officer'
            : roleFromUrl === 'admin'
            ? '/dashboard/admin'
            : '/dashboard/user'
        );
      } else {
        setError(data.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to the verification server. Ensure the backend is active.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>

      {/* ── Official Government Top Bar ── */}
      <Box
        sx={{
          bgcolor: '#06162D',
          color: '#CBD5E1',
          py: 0.8,
          px: { xs: 2, sm: 3, md: 4 },
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Box
          sx={{
            maxWidth: 1240,
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
          </Box>
          <Typography variant="caption" sx={{ color: '#94A3B8', display: { xs: 'none', sm: 'inline' } }}>
            National Metrology Single Sign-On (SSO) Portal
          </Typography>
        </Box>
      </Box>

      {/* ── Professional Sticky Header ── */}
      <Box
        component="header"
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          py: 1.5,
          px: { xs: 2, sm: 3, md: 4 },
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Box
          sx={{
            maxWidth: 1240,
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box
            component="a"
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '10px',
                bgcolor: '#0F2B4E',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AccountBalanceRoundedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                Legal Metrology Verification System
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                Ministry of Consumer Affairs, Food &amp; Public Distribution
              </Typography>
            </Box>
          </Box>

          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/')}
            sx={{
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.88rem',
              borderRadius: '8px',
              textTransform: 'none',
              border: '1px solid #E2E8F0',
              px: 2,
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            }}
          >
            Back to Public Portal
          </Button>
        </Box>
      </Box>

      {/* ── Main Login Container ── */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 5, md: 8 },
          px: 2,
          position: 'relative',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3.5, sm: 5 },
              borderRadius: '24px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(15, 23, 42, 0.04)',
              bgcolor: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Color Accent Line */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: portal.gradient,
              }}
            />

            {/* Portal Badge & Icon Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '20px',
                  background: portal.lightBg,
                  border: `1.5px solid ${portal.accentBorder}`,
                  color: portal.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  boxShadow: `0 8px 20px ${portal.color}25`,
                }}
              >
                <PortalIcon sx={{ fontSize: 34 }} />
              </Box>

              <Chip
                label={portal.roleBadge}
                size="small"
                sx={{
                  bgcolor: portal.lightBg,
                  color: portal.darkColor,
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  letterSpacing: '0.04em',
                  border: `1px solid ${portal.accentBorder}`,
                  mb: 1.5,
                  py: 0.4,
                }}
              />

              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 900,
                  color: '#0F172A',
                  fontSize: { xs: '1.6rem', sm: '1.9rem' },
                  letterSpacing: '-0.02em',
                  mb: 0.5,
                }}
              >
                {portal.label}
              </Typography>

              <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 420, mx: 'auto', lineHeight: 1.5 }}>
                {portal.hint}
              </Typography>
            </Box>

            {/* Quick Demo Credentials Pill with One-Click Fill */}
            <Box
              sx={{
                mb: 3,
                p: 1.75,
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                  DEMO ACCESS CREDENTIALS:
                </Typography>
                <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700 }}>
                  admin@example.com &nbsp;|&nbsp; AdminPassword123!
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={fillDemoCredentials}
                startIcon={<FlashOnRoundedIcon sx={{ fontSize: '1rem !important' }} />}
                sx={{
                  color: portal.darkColor,
                  borderColor: portal.accentBorder,
                  bgcolor: portal.lightBg,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  textTransform: 'none',
                  py: 0.5,
                  '&:hover': {
                    bgcolor: portal.accentBorder,
                    borderColor: portal.color,
                  },
                }}
              >
                Auto Fill
              </Button>
            </Box>

            {/* Error Message */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2.5,
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                }}
              >
                {error}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.75, display: 'block' }}>
                  OFFICIAL EMAIL ADDRESS
                </Typography>
                <TextField
                  id="login-email"
                  type="email"
                  fullWidth
                  required
                  placeholder="name@domain.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRoundedIcon sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: '#FFFFFF',
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.75, display: 'block' }}>
                  SECURE PASSWORD
                </Typography>
                <TextField
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRoundedIcon sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: '#FFFFFF',
                    },
                  }}
                />
              </Box>

              <Button
                id="login-submit-btn"
                type="submit"
                variant="contained"
                disabled={submitting}
                fullWidth
                sx={{
                  mt: 1,
                  py: 1.6,
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: '12px',
                  background: portal.gradient,
                  color: '#FFFFFF',
                  textTransform: 'none',
                  boxShadow: `0 6px 20px ${portal.color}35`,
                  '&:hover': {
                    background: portal.gradient,
                    filter: 'brightness(0.95)',
                  },
                }}
              >
                {submitting ? 'Verifying Credentials...' : `Sign In to ${portal.label}`}
              </Button>

              {roleFromUrl === 'user' && (
                <>
                  <Divider sx={{ my: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                      OR NEW REGISTRATION
                    </Typography>
                  </Divider>
                  <Button
                    id="goto-register-btn"
                    component={Link}
                    to="/register"
                    variant="outlined"
                    fullWidth
                    sx={{
                      py: 1.4,
                      fontWeight: 700,
                      borderRadius: '12px',
                      borderColor: portal.color,
                      color: portal.darkColor,
                      textTransform: 'none',
                      '&:hover': { bgcolor: portal.lightBg, borderColor: portal.darkColor },
                    }}
                  >
                    Register New Instrument Owner / Citizen Account
                  </Button>
                </>
              )}
            </Box>

            {/* Bottom Security Note */}
            <Box sx={{ mt: 4, pt: 2.5, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <ShieldRoundedIcon sx={{ fontSize: 16, color: '#15803D' }} />
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                Protected by 256-Bit SSL Encryption • Official Government Gateway
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* ── Official Footer ── */}
      <Box sx={{ bgcolor: '#06162D', color: '#94A3B8', py: 2.5, textAlign: 'center', px: 2 }}>
        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '0.8rem' }}>
          © 2026 Legal Metrology Verification System &nbsp;|&nbsp; Ministry of Consumer Affairs, Food &amp; Public Distribution &nbsp;|&nbsp; Government of India
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5, fontSize: '0.72rem' }}>
          Smart India Hackathon 2026 • Problem Statement SIH26036
        </Typography>
      </Box>
    </Box>
  );
}
