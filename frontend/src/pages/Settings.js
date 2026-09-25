import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

export default function Settings() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

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
            fullName: p.full_name || '',
            email: data.user?.email || '',
            phone: p.phone || '',
            organization: p.organization || '',
            address: p.address || '',
            city: p.city || '',
            state: p.state || '',
            pincode: p.pincode || '',
          });
        } else {
          setError('Could not load profile. Please log in again.');
        }
      } catch (err) {
        setError('Could not connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
    setError('');
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
    setSaved(false);
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
          full_name: profile.fullName,
          phone: profile.phone,
          organization: profile.organization,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          pincode: profile.pincode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error || 'Failed to save settings.');
      }
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Manage your account and system preferences.
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your settings have been saved successfully.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
            Profile Information
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Full Name *" name="fullName" value={profile.fullName} onChange={handleProfileChange} fullWidth required variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email Address" name="email" type="email" value={profile.email} fullWidth variant="outlined" disabled helperText="Email cannot be changed here" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone Number *" name="phone" value={profile.phone} onChange={handleProfileChange} fullWidth required variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Organization *" name="organization" value={profile.organization} onChange={handleProfileChange} fullWidth required variant="outlined" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Address *" name="address" value={profile.address} onChange={handleProfileChange} fullWidth required multiline rows={2} variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField label="City *" name="city" value={profile.city} onChange={handleProfileChange} fullWidth required variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="State *" name="state" value={profile.state} onChange={handleProfileChange} fullWidth required variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Pincode *" name="pincode" value={profile.pincode} onChange={handleProfileChange} fullWidth required variant="outlined" inputProps={{ maxLength: 6 }} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
            Notification Preferences
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel control={<Switch name="emailNotifications" checked={notifications.emailNotifications} onChange={handleNotificationChange} />} label={<Box><Typography variant="body2" sx={{ fontWeight: 700 }}>Email Notifications</Typography><Typography variant="caption" sx={{ color: '#757575' }}>Receive updates about your applications via email</Typography></Box>} />
            <Divider />
            <FormControlLabel control={<Switch name="smsNotifications" checked={notifications.smsNotifications} onChange={handleNotificationChange} />} label={<Box><Typography variant="body2" sx={{ fontWeight: 700 }}>SMS Notifications</Typography><Typography variant="caption" sx={{ color: '#757575' }}>Receive SMS alerts for urgent updates</Typography></Box>} />
            <Divider />
            <FormControlLabel control={<Switch name="pushNotifications" checked={notifications.pushNotifications} onChange={handleNotificationChange} />} label={<Box><Typography variant="body2" sx={{ fontWeight: 700 }}>Push Notifications</Typography><Typography variant="caption" sx={{ color: '#757575' }}>Receive browser notifications for real-time updates</Typography></Box>} />
            <Divider />
            <FormControlLabel control={<Switch name="weeklyReports" checked={notifications.weeklyReports} onChange={handleNotificationChange} />} label={<Box><Typography variant="body2" sx={{ fontWeight: 700 }}>Weekly Summary Reports</Typography><Typography variant="caption" sx={{ color: '#757575' }}>Receive a weekly summary of your applications and certificates</Typography></Box>} />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
            Security Settings
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button variant="outlined" sx={{ borderColor: '#0D47A1', color: '#0D47A1' }} fullWidth>Change Password</Button>
            <Button variant="outlined" sx={{ borderColor: '#0D47A1', color: '#0D47A1' }} fullWidth>Enable Two-Factor Authentication</Button>
            <Button variant="outlined" sx={{ borderColor: '#0D47A1', color: '#0D47A1' }} fullWidth>View Login History</Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
            Help & Support
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><Button variant="outlined" sx={{ borderColor: '#0D47A1', color: '#0D47A1' }} fullWidth>View FAQs</Button></Grid>
            <Grid item xs={12} sm={6}><Button variant="outlined" sx={{ borderColor: '#0D47A1', color: '#0D47A1' }} fullWidth>Contact Support</Button></Grid>
            <Grid item xs={12} sm={6}><Button variant="outlined" sx={{ borderColor: '#0D47A1', color: '#0D47A1' }} fullWidth>User Guide</Button></Grid>
            <Grid item xs={12} sm={6}><Button variant="outlined" sx={{ borderColor: '#0D47A1', color: '#0D47A1' }} fullWidth>Report Issue</Button></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 4 }}>
        <Button
          variant="contained"
          sx={{ bgcolor: '#0D47A1' }}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      <Alert severity="info">
        All your settings are encrypted and stored securely. Changes take effect immediately.
      </Alert>
    </Container>
  );
}
