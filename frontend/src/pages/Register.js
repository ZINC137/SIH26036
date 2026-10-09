import React, { useState } from 'react';
import {
  Box, Container, Paper, TextField, Button, Typography,
  Stepper, Step, StepLabel, Alert, Grid, InputAdornment,
  CircularProgress, Divider, IconButton,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import API_BASE from '../config/api';
import { useLanguage } from '../i18n/LanguageContext';

const steps = ['Create Account', 'Personal Details', 'Done'];

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '&:hover fieldset': { borderColor: '#1565C0' },
    '&.Mui-focused fieldset': { borderColor: '#0D47A1' },
  },
};

export default function Register() {
  const { t, language, setLanguage, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  // Step state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: profile
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Email verification extra state
  const [verificationUrl, setVerificationUrl] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus({ type: 'success', message: data.message || 'Verification email resent! Please check your inbox and spam folder.' });
        if (data.verificationUrl) setVerificationUrl(data.verificationUrl);
      } else {
        setResendStatus({ type: 'error', message: data.error || 'Failed to resend verification email.' });
      }
    } catch (err) {
      setResendStatus({ type: 'error', message: 'Could not connect to verification server.' });
    } finally {
      setResending(false);
    }
  };

  // --- Step 1: Validate credentials locally, no API call yet ---
  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 12) {
      setError('Password must be at least 12 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Move to profile step — actual API call happens at Step 2
    setActiveStep(1);
  };

  // --- Step 2: Submit everything to /register in one call ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all profile fields
    const missing = [];
    if (!fullName)       missing.push('Full Name');
    if (!phone)          missing.push('Phone Number');
    if (!organization)   missing.push('Organization');
    if (!address)        missing.push('Address');
    if (!city)           missing.push('City');
    if (!state)          missing.push('State');
    if (!pincode)        missing.push('Pincode');

    if (missing.length > 0) {
      setError(`Please fill in all required fields: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      // Single call — creates user + profile atomically, sends verification email
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          full_name: fullName,
          phone,
          organization,
          address,
          city,
          state,
          pincode,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.verificationUrl) {
          setVerificationUrl(data.verificationUrl);
        }
        setActiveStep(2);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 8) return { label: 'Too Short', color: '#f44336' };
    if (pwd.length < 12) return { label: 'Weak', color: '#ff9800' };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return { label: 'Strong', color: '#4caf50' };
    return { label: 'Moderate', color: '#2196f3' };
  };

  const strength = getPasswordStrength(password);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F0F4FF', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)', color: 'white', py: 2, px: 3, boxShadow: 3 }}>
                <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              {t('Legal Metrology Verification System')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {t('Ministry of Consumer Affairs, Government of India')}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            onClick={toggleLanguage}
            data-no-translate="true"
            translate="no"
            id="register-language-toggle-btn"
            title={language === 'en' ? 'हिन्दी में देखें' : 'Switch to English'}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              px: 1.2,
              py: 0.4,
              borderRadius: '6px',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              userSelect: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <Box
              component="span"
              onClick={(e) => {
                e.stopPropagation();
                setLanguage('en');
              }}
              sx={{
                color: language === 'en' ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                fontWeight: language === 'en' ? 800 : 500,
                cursor: 'pointer',
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
                color: language === 'hi' ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                fontWeight: language === 'hi' ? 800 : 500,
                cursor: 'pointer',
              }}
            >
              हिन्दी
            </Box>
          </Typography>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 5 }}>
        <Box sx={{ width: '100%' }}>
          <Paper
            elevation={8}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              background: 'white',
              boxShadow: '0 8px 40px rgba(13,71,161,0.12)',
            }}
          >
            {/* Icon */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0D47A1, #1565C0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(13,71,161,0.3)',
              }}>
                <PersonIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
            </Box>

            <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 700, color: '#0D47A1', mb: 3 }}>
              {t('Create Your Account')}
            </Typography>

            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{t(label)}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            {/* ---- STEP 0: Account Credentials ---- */}
            {activeStep === 0 && (
              <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  id="register-email"
                  label={t('Email Address')}
                  type="email"
                  variant="outlined"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
                />
                <Box>
                  <TextField
                    id="register-password"
                    label={t('Password')}
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('Minimum 12 characters')}
                    sx={inputSx}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#9E9E9E' }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {strength && (
                    <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: '#E0E0E0' }}>
                        <Box sx={{
                          height: '100%', borderRadius: 2, bgcolor: strength.color,
                          width: strength.label === 'Too Short' ? '20%' : strength.label === 'Weak' ? '45%' : strength.label === 'Moderate' ? '70%' : '100%',
                          transition: 'width 0.3s',
                        }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: strength.color, fontWeight: 600, minWidth: 60 }}>{t(strength.label)}</Typography>
                    </Box>
                  )}
                </Box>
                <TextField
                  id="register-confirm-password"
                  label={t('Confirm Password')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  variant="outlined"
                  fullWidth
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('Re-enter your password')}
                  sx={inputSx}
                  error={confirmPassword.length > 0 && password !== confirmPassword}
                  helperText={confirmPassword.length > 0 && password !== confirmPassword ? t('Passwords do not match') : ''}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#9E9E9E' }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  id="register-submit-btn"
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 1, py: 1.5, fontWeight: 700, fontSize: '1rem', borderRadius: 2,
                    background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
                    boxShadow: '0 4px 12px rgba(13,71,161,0.3)',
                    '&:hover': { background: 'linear-gradient(135deg, #0D3B8C 0%, #1255AB 100%)' },
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : t('Create Account →')}
                </Button>

                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ textAlign: 'center', color: '#757575' }}>
                  {t('Already have an account?')}{' '}
                  <Link to="/login" style={{ color: '#0D47A1', fontWeight: 600, textDecoration: 'none' }}>
                    {t('Sign In')}
                  </Link>
                </Typography>
              </Box>
            )}

            {/* ---- STEP 1: Personal Details ---- */}
            {activeStep === 1 && (
              <Box component="form" onSubmit={handleSaveProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  {t('Account created! Please fill in your details below. This info is stored securely.')}
                </Alert>

                <TextField
                  id="profile-fullname"
                  label={t('Full Name *')}
                  variant="outlined"
                  fullWidth
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
                />

                <TextField
                  id="profile-phone"
                  label={t('Phone Number *')}
                  variant="outlined"
                  fullWidth
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
                />

                <TextField
                  id="profile-organization"
                  label={t('Organization / Company *')}
                  variant="outlined"
                  fullWidth
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
                />

                <TextField
                  id="profile-address"
                  label={t('Address *')}
                  variant="outlined"
                  fullWidth
                  required
                  multiline
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mt: '-32px' }}><HomeIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={5}>
                    <TextField id="profile-city" label={t('City *')} variant="outlined" fullWidth required value={city} onChange={(e) => setCity(e.target.value)} sx={inputSx} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField id="profile-state" label={t('State *')} variant="outlined" fullWidth required value={state} onChange={(e) => setState(e.target.value)} sx={inputSx} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField id="profile-pincode" label={t('Pincode *')} variant="outlined" fullWidth required value={pincode} onChange={(e) => setPincode(e.target.value)} sx={inputSx} inputProps={{ maxLength: 6 }} />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button
                    id="profile-save-btn"
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                      py: 1.5, fontWeight: 700, borderRadius: 2,
                      background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
                      boxShadow: '0 4px 12px rgba(13,71,161,0.3)',
                    }}
                  >
                    {loading ? <CircularProgress size={22} color="inherit" /> : t('Save & Continue →')}
                  </Button>
                </Box>
              </Box>
            )}

            {/* ---- STEP 2: Done ---- */}
            {activeStep === 2 && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 72, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2E7D32', mb: 1 }}>
                  {t('Registration Complete!')}
                </Typography>
                <Typography variant="body1" sx={{ color: '#757575', mb: 1 }}>
                  {t('Your account has been created successfully.')}
                </Typography>

                <Box sx={{ mt: 3, p: 2.5, bgcolor: '#E8F5E9', borderRadius: 2, border: '1px solid #A5D6A7', mb: 3, textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 600, mb: 0.5 }}>
                    {t('Statutory verification email sent to:')}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: '#1B5E20', fontWeight: 700, mb: 1 }}>
                    {email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#388E3C', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {t('Please check your inbox (including Spam/Junk folder) and click the verification button to activate your account.')}
                  </Typography>

                  {verificationUrl && (
                    <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px dashed #A5D6A7' }}>
                      <Typography variant="caption" sx={{ color: '#1B5E20', fontWeight: 700, display: 'block', mb: 1, letterSpacing: 0.5 }}>
                        {t('INSTANT 1-CLICK ACTIVATION (DIRECT LINK):')}
                      </Typography>
                      <Button
                        size="medium"
                        variant="contained"
                        fullWidth
                        href={verificationUrl}
                        target="_blank"
                        rel="noreferrer"
                        sx={{
                          py: 1,
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 100%)',
                          color: '#ffffff',
                          boxShadow: '0 4px 12px rgba(46,125,50,0.3)',
                          '&:hover': { background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)' },
                        }}
                      >
                        {t('Click Here to Verify & Activate Instantly →')}
                      </Button>
                    </Box>
                  )}
                </Box>

                {resendStatus && (
                  <Alert severity={resendStatus.type} sx={{ mb: 2.5, textAlign: 'left', borderRadius: 2 }}>
                    {resendStatus.message}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button
                    id="register-goto-login-btn"
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/login')}
                    sx={{
                      py: 1.5, fontWeight: 700, fontSize: '1rem', borderRadius: 2,
                      background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
                    }}
                  >
                    {t('Go to Login')}
                  </Button>

                  <Button
                    id="register-resend-btn"
                    variant="text"
                    disabled={resending}
                    onClick={handleResend}
                    sx={{ textTransform: 'none', color: '#1565C0', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    {resending ? t('Resending verification email...') : t("Didn't receive the email? Click here to resend")}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#212121', color: 'white', py: 2, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="body2">
            {t('© 2026 Legal Metrology Verification System | Ministry of Consumer Affairs')}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
