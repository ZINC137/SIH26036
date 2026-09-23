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

const steps = ['Create Account', 'Personal Details', 'Done'];

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '&:hover fieldset': { borderColor: '#1565C0' },
    '&.Mui-focused fieldset': { borderColor: '#0D47A1' },
  },
};

export default function Register() {
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

  // After login, save the session token to submit profile
  const [sessionCookie, setSessionCookie] = useState(false);

  // --- Step 1: Register account ---
  const handleRegister = async (e) => {
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

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        // Auto-login to get a session cookie so we can save profile
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });

        if (loginRes.ok) {
          setSessionCookie(true);
        }

        setActiveStep(1);
      } else {
        setError(data.error || data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Save profile ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName) {
      setError('Full name is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, phone, organization, address, city, state, pincode }),
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        setActiveStep(2);
      } else {
        setError(data.error || 'Could not save profile.');
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
        <Container maxWidth="lg">
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            Legal Metrology Verification System
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Ministry of Consumer Affairs, Government of India
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
              Create Your Account
            </Typography>

            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            {/* ---- STEP 0: Account Credentials ---- */}
            {activeStep === 0 && (
              <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  id="register-email"
                  label="Email Address"
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
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 12 characters"
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
                      <Typography variant="caption" sx={{ color: strength.color, fontWeight: 600, minWidth: 60 }}>{strength.label}</Typography>
                    </Box>
                  )}
                </Box>
                <TextField
                  id="register-confirm-password"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  variant="outlined"
                  fullWidth
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  sx={inputSx}
                  error={confirmPassword.length > 0 && password !== confirmPassword}
                  helperText={confirmPassword.length > 0 && password !== confirmPassword ? 'Passwords do not match' : ''}
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
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account →'}
                </Button>

                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ textAlign: 'center', color: '#757575' }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: '#0D47A1', fontWeight: 600, textDecoration: 'none' }}>
                    Sign In
                  </Link>
                </Typography>
              </Box>
            )}

            {/* ---- STEP 1: Personal Details ---- */}
            {activeStep === 1 && (
              <Box component="form" onSubmit={handleSaveProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Account created! Please fill in your details below. This info is stored securely.
                </Alert>

                <TextField
                  id="profile-fullname"
                  label="Full Name *"
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
                  label="Phone Number"
                  variant="outlined"
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
                />

                <TextField
                  id="profile-organization"
                  label="Organization / Company"
                  variant="outlined"
                  fullWidth
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
                />

                <TextField
                  id="profile-address"
                  label="Address"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mt: '-32px' }}><HomeIcon sx={{ color: '#9E9E9E' }} /></InputAdornment> }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={5}>
                    <TextField id="profile-city" label="City" variant="outlined" fullWidth value={city} onChange={(e) => setCity(e.target.value)} sx={inputSx} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField id="profile-state" label="State" variant="outlined" fullWidth value={state} onChange={(e) => setState(e.target.value)} sx={inputSx} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField id="profile-pincode" label="Pincode" variant="outlined" fullWidth value={pincode} onChange={(e) => setPincode(e.target.value)} sx={inputSx} inputProps={{ maxLength: 6 }} />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button
                    id="profile-skip-btn"
                    variant="outlined"
                    fullWidth
                    onClick={() => setActiveStep(2)}
                    sx={{ py: 1.5, borderRadius: 2, color: '#757575', borderColor: '#BDBDBD' }}
                  >
                    Skip for Now
                  </Button>
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
                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Save & Continue →'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* ---- STEP 2: Done ---- */}
            {activeStep === 2 && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 72, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2E7D32', mb: 1 }}>
                  Registration Complete!
                </Typography>
                <Typography variant="body1" sx={{ color: '#757575', mb: 1 }}>
                  Your account has been created successfully.
                </Typography>
                <Box sx={{ mt: 3, p: 2, bgcolor: '#E8F5E9', borderRadius: 2, border: '1px solid #A5D6A7', mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#2E7D32' }}>
                    📧 A verification email has been sent to <strong>{email}</strong>.<br />
                    Please check your inbox and verify your email before logging in.
                  </Typography>
                </Box>
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
                  Go to Login
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#212121', color: 'white', py: 2, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="body2">
            © 2026 Legal Metrology Verification System | Ministry of Consumer Affairs
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
