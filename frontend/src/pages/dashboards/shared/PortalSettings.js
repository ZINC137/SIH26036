import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Button,
  Divider, Switch, FormControlLabel, Alert, CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const ROLE_META = {
  user:          { label: 'Public User',   color: '#E65100', gradient: 'linear-gradient(135deg, #FF6D00, #E65100)' },
  lmo:           { label: 'LMO Officer',   color: '#1B5E20', gradient: 'linear-gradient(135deg, #2E7D32, #1B5E20)' },
  field_officer: { label: 'Field Officer', color: '#4A148C', gradient: 'linear-gradient(135deg, #7B1FA2, #4A148C)' },
  admin:         { label: 'Administrator', color: '#B71C1C', gradient: 'linear-gradient(135deg, #C62828, #B71C1C)' },
};

export default function PortalSettings({ userRole = 'user', userEmail = '' }) {
  const meta = ROLE_META[userRole] || ROLE_META.user;

  const [profile, setProfile] = useState({
    fullName: '',
    email: userEmail,
    phone: '',
    organization: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Fetch real profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          const p = data.user?.profile || {};
          setProfile({
            fullName:     p.full_name     || '',
            email:        data.user?.email || userEmail,
            phone:        p.phone         || '',
            organization: p.organization  || '',
            address:      p.address       || '',
            city:         p.city          || '',
            state:        p.state         || '',
            pincode:      p.pincode       || '',
          });
        } else {
          setError('Could not load profile. Please log in again.');
        }
      } catch {
        setError('Could not connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
    setError('');
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          full_name:    profile.fullName,
          phone:        profile.phone,
          organization: profile.organization,
          address:      profile.address,
          city:         profile.city,
          state:        profile.state,
          pincode:      profile.pincode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error || 'Failed to save settings.');
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setSaving(false);
    }
  };

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: meta.color, fontWeight: 700, letterSpacing: 1.5 }}>
          {meta.label.toUpperCase()} PORTAL
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>Settings</Typography>
      </Box>

      {saved && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSaved(false)}>Settings saved successfully!</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Profile */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E0E0E0', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Profile Information</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Full Name *" name="fullName" value={profile.fullName} onChange={handleChange} required sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Email Address" name="email" value={profile.email} disabled helperText="Email cannot be changed here" sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Phone Number *" name="phone" value={profile.phone} onChange={handleChange} required sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Organization *" name="organization" value={profile.organization} onChange={handleChange} required sx={inputSx} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Address *" name="address" value={profile.address} onChange={handleChange} required multiline rows={2} sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField fullWidth label="City *" name="city" value={profile.city} onChange={handleChange} required sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="State *" name="state" value={profile.state} onChange={handleChange} required sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Pincode *" name="pincode" value={profile.pincode} onChange={handleChange} required inputProps={{ maxLength: 6 }} sx={inputSx} />
          </Grid>
        </Grid>
      </Paper>

      {/* Notifications */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E0E0E0', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Notification Preferences</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />}
            label={<Box><Typography variant="body2" sx={{ fontWeight: 600 }}>Email Notifications</Typography><Typography variant="caption" sx={{ color: '#757575' }}>Receive updates about applications and approvals</Typography></Box>}
          />
          <Divider />
          <FormControlLabel
            control={<Switch checked={smsNotif} onChange={(e) => setSmsNotif(e.target.checked)} />}
            label={<Box><Typography variant="body2" sx={{ fontWeight: 600 }}>SMS Notifications</Typography><Typography variant="caption" sx={{ color: '#757575' }}>Receive text messages for urgent updates</Typography></Box>}
          />
        </Box>
      </Paper>

      {/* Password */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E0E0E0', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Change Password</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}><TextField fullWidth label="Current Password" type="password" sx={inputSx} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="New Password" type="password" sx={inputSx} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Confirm New Password" type="password" sx={inputSx} /></Grid>
        </Grid>
      </Paper>

      <Button
        variant="contained"
        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
        size="large"
        disabled={saving}
        sx={{ background: meta.gradient, borderRadius: 2, fontWeight: 700, px: 4 }}
        onClick={handleSave}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </Box>
  );
}
