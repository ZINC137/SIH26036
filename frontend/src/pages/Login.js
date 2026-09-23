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
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PORTAL_CONFIG = {
  user: {
    label: 'Public User Portal',
    color: '#E65100',
    gradient: 'linear-gradient(135deg, #FF6D00, #E65100)',
    lightBg: '#FFF3E0',
    hint: 'Login with your registered citizen account',
  },
  lmo: {
    label: 'LMO Officer Portal',
    color: '#1B5E20',
    gradient: 'linear-gradient(135deg, #2E7D32, #1B5E20)',
    lightBg: '#E8F5E9',
    hint: 'Login with your official LMO department credentials',
  },
  field_officer: {
    label: 'Field Officer Portal',
    color: '#4A148C',
    gradient: 'linear-gradient(135deg, #7B1FA2, #4A148C)',
    lightBg: '#F3E5F5',
    hint: 'Login with your field inspector credentials',
  },
  admin: {
    label: 'Administrator Portal',
    color: '#B71C1C',
    gradient: 'linear-gradient(135deg, #C62828, #B71C1C)',
    lightBg: '#FFEBEE',
    hint: 'Restricted access — System administrators only',
  },
};

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') || 'user';
  const portal = PORTAL_CONFIG[roleFromUrl] || PORTAL_CONFIG.user;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(roleFromUrl, data.user?.email || email);
        navigate(
          roleFromUrl === 'lmo' ? '/dashboard/lmo' :
          roleFromUrl === 'field_officer' ? '/dashboard/field-officer' :
          roleFromUrl === 'admin' ? '/dashboard/admin' :
          '/dashboard/user'
        );
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to the server. Is the backend running?');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: portal.lightBg, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D47A1 100%)', color: 'white', py: 2, px: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Legal Metrology Verification System</Typography>
              <Typography variant="caption" sx={{ opacity: 0.75 }}>Ministry of Consumer Affairs, Government of India</Typography>
            </Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white' }, textTransform: 'none' }}
            >
              All Portals
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Portal Banner */}
      <Box sx={{ background: portal.gradient, py: 3, textAlign: 'center' }}>
        <Chip
          icon={<LockIcon sx={{ color: 'white !important', fontSize: '14px !important' }} />}
          label={portal.label}
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, backdropFilter: 'blur(8px)', px: 1 }}
        />
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 1 }}>
          {portal.hint}
        </Typography>
      </Box>

      {/* Login Card */}
      <Container maxWidth="xs" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 5 }}>
        <Paper
          elevation={12}
          sx={{
            width: '100%', p: 4, borderRadius: 4,
            boxShadow: `0 16px 48px ${portal.color}22`,
            border: `1px solid ${portal.color}33`,
          }}
        >
          {/* Icon */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{
              width: 60, height: 60, borderRadius: '50%',
              background: portal.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 16px ${portal.color}44`,
            }}>
              <LockIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
          </Box>

          <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 800, color: '#1A1A2E', mb: 0.5 }}>
            Secure Login
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#757575', mb: 3 }}>
            Enter your credentials to continue
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              id="login-email"
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#9E9E9E' }} /></InputAdornment>,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              id="login-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Button
              id="login-submit-btn"
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 1, py: 1.5, fontWeight: 700, fontSize: '1rem', borderRadius: 2,
                background: portal.gradient,
                boxShadow: `0 4px 16px ${portal.color}44`,
                '&:hover': { background: portal.gradient, opacity: 0.9 },
              }}
            >
              Sign In
            </Button>

            {roleFromUrl === 'user' && (
              <>
                <Divider sx={{ my: 0.5 }}><Typography variant="caption" color="text.secondary">or</Typography></Divider>
                <Button
                  id="goto-register-btn"
                  component={Link}
                  to="/register"
                  variant="outlined"
                  fullWidth
                  sx={{
                    py: 1.4, fontWeight: 700, borderRadius: 2,
                    borderColor: portal.color, color: portal.color,
                    '&:hover': { bgcolor: portal.lightBg },
                  }}
                >
                  Create New Account
                </Button>
              </>
            )}
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: portal.lightBg, borderRadius: 2, borderLeft: `4px solid ${portal.color}` }}>
            <Typography variant="caption" sx={{ color: '#616161' }}>
              <strong>Test:</strong> admin@example.com / AdminPassword123!
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#0A1628', color: 'white', py: 2, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            © 2026 Legal Metrology Verification System | Ministry of Consumer Affairs
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
