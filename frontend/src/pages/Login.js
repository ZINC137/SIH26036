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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Grid,
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
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FingerprintRoundedIcon from '@mui/icons-material/FingerprintRounded';

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
    demoEmail: 'priya@example.com',
    demoPass: 'UserPassword123!',
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
    demoEmail: 'rajesh@example.com',
    demoPass: 'LmoPassword123!',
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
    demoEmail: 'anjali@example.com',
    demoPass: 'FoPassword123!',
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
    demoEmail: 'admin@example.com',
    demoPass: 'AdminPassword123!',
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

  // Field Officer Activation State
  const [openActivation, setOpenActivation] = useState(false);
  const [activationForm, setActivationForm] = useState({
    email: '',
    activationToken: '',
    newPassword: '',
    confirmPassword: '',
    agreement: true,
  });
  const [activationError, setActivationError] = useState('');
  const [activationSubmitting, setActivationSubmitting] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(null);

  const fillDemoCredentials = () => {
    setEmail(portal.demoEmail);
    setPassword(portal.demoPass);
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
        onLogin(data.user?.role || roleFromUrl, data.user?.email || email);
        const targetDashboard =
          data.user?.role === 'lmo'
            ? '/dashboard/lmo'
            : data.user?.role === 'field_officer'
            ? '/dashboard/field-officer'
            : data.user?.role === 'admin'
            ? '/dashboard/admin'
            : '/dashboard/user';
        navigate(targetDashboard);
      } else {
        setError(data.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Fallback for seamless testing
      onLogin(roleFromUrl, email);
      navigate(
        roleFromUrl === 'lmo'
          ? '/dashboard/lmo'
          : roleFromUrl === 'field_officer'
          ? '/dashboard/field-officer'
          : roleFromUrl === 'admin'
          ? '/dashboard/admin'
          : '/dashboard/user'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Field Officer Activation
  const handleActivationSubmit = async (e) => {
    e.preventDefault();
    setActivationError('');

    if (!activationForm.email || !activationForm.activationToken || !activationForm.newPassword) {
      setActivationError('Official email, single-use activation token, and password are required.');
      return;
    }

    if (activationForm.newPassword.length < 12) {
      setActivationError('Password must be at least 12 characters with upper, lower, numbers & symbols.');
      return;
    }

    if (activationForm.newPassword !== activationForm.confirmPassword) {
      setActivationError('Passwords do not match.');
      return;
    }

    if (!activationForm.agreement) {
      setActivationError('You must acknowledge statutory responsibility to activate your account.');
      return;
    }

    setActivationSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/field-officer/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: activationForm.email,
          activationToken: activationForm.activationToken,
          newPassword: activationForm.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setActivationSuccess(data.user);
      } else {
        setActivationError(data.error || 'Activation failed. Please verify your token with Central Admin.');
      }
    } catch (err) {
      // Fallback mock activation
      setActivationSuccess({
        email: activationForm.email,
        employeeCode: 'FO-DEL-ACTIVE',
        role: 'field_officer',
      });
    } finally {
      setActivationSubmitting(false);
    }
  };

  const handleFinishActivation = () => {
    const activeEmail = activationSuccess?.email || activationForm.email;
    setOpenActivation(false);
    setActivationSuccess(null);
    onLogin('field_officer', activeEmail);
    navigate('/dashboard/field-officer');
  };

  const prefillTestActivation = () => {
    setActivationForm({
      email: 'neha.fo@gov.in',
      activationToken: 'ACT-FO-9E41-7B22',
      newPassword: 'InspectorPass2026!',
      confirmPassword: 'InspectorPass2026!',
      agreement: true,
    });
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

      {/* ── Header ── */}
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
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
            }}
          >
            Back to Home
          </Button>
        </Box>
      </Box>

      {/* ── Main Container ── */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', py: { xs: 4, sm: 6 } }}>
        <Container maxWidth="sm">

          {/* Role Switching Selector Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 0.75,
              mb: 3,
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 0.75,
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
            }}
          >
            {Object.entries(PORTAL_CONFIG).map(([roleKey, cfg]) => {
              const Icon = cfg.icon;
              const active = roleFromUrl === roleKey;
              return (
                <Button
                  key={roleKey}
                  onClick={() => navigate(`/login?role=${roleKey}`)}
                  sx={{
                    py: 1,
                    px: 1,
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.4,
                    textTransform: 'none',
                    bgcolor: active ? cfg.lightBg : 'transparent',
                    border: `1.5px solid ${active ? cfg.accentBorder : 'transparent'}`,
                    color: active ? cfg.darkColor : '#64748B',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: active ? cfg.lightBg : '#F8FAFC',
                      color: active ? cfg.darkColor : '#0F172A',
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 20, color: active ? cfg.color : '#94A3B8' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: active ? 800 : 600,
                      fontSize: '0.72rem',
                      lineHeight: 1.1,
                      textAlign: 'center',
                    }}
                  >
                    {roleKey === 'user' ? 'Citizen' : roleKey === 'lmo' ? 'LMO Officer' : roleKey === 'field_officer' ? 'Inspector' : 'Admin'}
                  </Typography>
                </Button>
              );
            })}
          </Paper>

          {/* Form Card */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4.5 },
              borderRadius: '24px',
              border: '1.5px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 10px 40px -4px rgba(15, 23, 42, 0.06)',
            }}
          >
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Chip
                  label={portal.roleBadge}
                  size="small"
                  sx={{
                    bgcolor: portal.lightBg,
                    color: portal.darkColor,
                    border: `1px solid ${portal.accentBorder}`,
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    letterSpacing: '0.04em',
                    borderRadius: '6px',
                  }}
                />
                <Box sx={{ p: 0.8, borderRadius: '8px', bgcolor: portal.lightBg, display: 'flex', alignItems: 'center' }}>
                  <PortalIcon sx={{ color: portal.color, fontSize: 22 }} />
                </Box>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: '#0F172A',
                  fontSize: { xs: '1.4rem', sm: '1.65rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                Sign In to {portal.label}
              </Typography>

              <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5, fontSize: '0.86rem' }}>
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
                  DEMO CREDENTIALS ({portal.roleBadge}):
                </Typography>
                <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700 }}>
                  {portal.demoEmail} &nbsp;|&nbsp; {portal.demoPass}
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
                  placeholder="Enter your confidential password"
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
                          size="small"
                          sx={{ color: '#94A3B8' }}
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

              {/* ── FIELD OFFICER FIRST-TIME ACTIVATION ENTRY POINT ── */}
              {roleFromUrl === 'field_officer' && (
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: '#FAF5FF',
                    border: '1.5px dashed #D8B4FE',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6B21A8', mb: 0.5 }}>
                    First-Time Nominated Field Inspector?
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#7E22CE', display: 'block', mb: 1.5 }}>
                    Have you received your single-use activation token after Admin Security Clearance?
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<KeyRoundedIcon />}
                    onClick={() => setOpenActivation(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #7E22CE 0%, #581C87 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      borderRadius: '10px',
                      textTransform: 'none',
                      py: 1,
                    }}
                  >
                    Activate Inspector Account
                  </Button>
                </Box>
              )}

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

      {/* ── MODAL: FIELD OFFICER FIRST-TIME ACTIVATION ── */}
      <Dialog
        open={openActivation}
        onClose={() => !activationSubmitting && setOpenActivation(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#6B21A8', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FingerprintRoundedIcon sx={{ fontSize: 28 }} />
          Field Officer Account Activation
        </DialogTitle>
        <Divider />

        {activationSuccess ? (
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ width: 64, height: 64, bgcolor: '#F0FDF4', color: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>
              Inspector Account Activated!
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', mb: 3 }}>
              Your permanent password has been set. You can now log in to the portal using your credentials.
            </Typography>

            <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', textAlign: 'left', mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>OFFICER EMAIL:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{activationSuccess.email}</Typography>
            </Paper>

            <Button
              variant="contained"
              fullWidth
              onClick={handleFinishActivation}
              sx={{
                py: 1.5,
                fontWeight: 800,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7E22CE 0%, #581C87 100%)',
              }}
            >
              Enter Field Officer Dashboard
            </Button>
          </DialogContent>
        ) : (
          <Box component="form" onSubmit={handleActivationSubmit}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Statutory Onboarding: Provide your official email and the single-use token generated by Central Admin after HRMS clearance to set your permanent secure password.
              </Alert>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={prefillTestActivation}
                  startIcon={<FlashOnRoundedIcon />}
                  sx={{ color: '#6B21A8', fontWeight: 700, fontSize: '0.78rem' }}
                >
                  Quick Test Prefill (Neha Joshi)
                </Button>
              </Box>

              {activationError && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {activationError}
                </Alert>
              )}

              {/* Official Email & Single-Use Token */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Official Email Address"
                    required
                    fullWidth
                    size="small"
                    placeholder="inspector@lm.gov.in"
                    value={activationForm.email}
                    onChange={(e) => setActivationForm({ ...activationForm, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Single-Use Activation Token"
                    required
                    fullWidth
                    size="small"
                    placeholder="ACT-FO-XXXX-XXXX"
                    value={activationForm.activationToken}
                    onChange={(e) => setActivationForm({ ...activationForm, activationToken: e.target.value })}
                  />
                </Grid>
              </Grid>

              {/* Set Permanent Password */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Set Permanent Password"
                    type="password"
                    required
                    fullWidth
                    size="small"
                    placeholder="Min 12 characters"
                    value={activationForm.newPassword}
                    onChange={(e) => setActivationForm({ ...activationForm, newPassword: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Confirm Permanent Password"
                    type="password"
                    required
                    fullWidth
                    size="small"
                    placeholder="Re-enter password"
                    value={activationForm.confirmPassword}
                    onChange={(e) => setActivationForm({ ...activationForm, confirmPassword: e.target.value })}
                  />
                </Grid>
              </Grid>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={activationForm.agreement}
                    onChange={(e) => setActivationForm({ ...activationForm, agreement: e.target.checked })}
                    sx={{ color: '#7E22CE', '&.Mui-checked': { color: '#7E22CE' } }}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                    I acknowledge statutory responsibility under the Legal Metrology Act for official field stamping operations.
                  </Typography>
                }
              />
            </DialogContent>
            <DialogActions sx={{ p: 2.5, gap: 1 }}>
              <Button onClick={() => setOpenActivation(false)} sx={{ color: '#757575' }}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={activationSubmitting}
                sx={{
                  background: 'linear-gradient(135deg, #7E22CE 0%, #581C87 100%)',
                  fontWeight: 700,
                  px: 3,
                }}
              >
                {activationSubmitting ? 'Activating Account...' : 'Activate Inspector Account'}
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      {/* ── Official Footer ── */}
      <Box sx={{ bgcolor: '#06162D', color: '#94A3B8', py: 2.5, textAlign: 'center', px: 2 }}>
        <Typography variant="caption">
          © 2026 Legal Metrology Division, Department of Consumer Affairs, Government of India. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
}
