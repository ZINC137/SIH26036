import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    onLogin(role);
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F5F5F5',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ bgcolor: '#0D47A1', color: 'white', py: 2, px: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Legal Metrology Verification System
          </Typography>
          <Typography variant="body2">Ministry of Consumer Affairs, Government of India</Typography>
        </Container>
      </Box>

      {/* Login Section */}
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 4 }}>
        <Box sx={{ width: '100%' }}>
          {/* Info Cards */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ border: '2px solid #FF9800' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 700 }}>
                    For Users
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: '#757575' }}>
                    Register and track your instrument verification applications
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ border: '2px solid #FF9800' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 700 }}>
                    For Officials
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: '#757575' }}>
                    Manage verifications and issue digital certificates
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Login Form */}
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <LockIcon sx={{ fontSize: 48, color: '#0D47A1' }} />
            </Box>

            <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontWeight: 700, color: '#0D47A1' }}>
              Secure Login
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email Address"
                type="email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />

              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />

              <FormControl fullWidth>
                <InputLabel>Login As</InputLabel>
                <Select
                  value={role}
                  label="Login As"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="user">Public User</MenuItem>
                  <MenuItem value="lmo">LMO Official</MenuItem>
                  <MenuItem value="field_officer">Field Officer</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#0D47A1',
                  color: 'white',
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1rem',
                  mt: 2,
                  '&:hover': {
                    bgcolor: '#1565C0',
                  },
                }}
              >
                Sign In
              </Button>
            </Box>

            <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: '#757575' }}>
              Demo Credentials: Any email and password
            </Typography>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#F5F5F5', borderLeft: '4px solid #FF9800' }}>
              <Typography variant="caption" sx={{ color: '#757575' }}>
                <strong>For Demo:</strong> Use any email and password combination. This is a prototype system.
              </Typography>
            </Box>
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
