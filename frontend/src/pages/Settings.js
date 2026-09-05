import React, { useState } from 'react';
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
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

export default function Settings() {
  const [userSettings, setUserSettings] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91-9876543210',
    organization: 'ABC Instruments Pvt Ltd',
    location: 'New Delhi',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserSettings({
      ...userSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Container maxWidth="md">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Manage your account and system preferences.
        </Typography>
      </Box>

      {/* Success Message */}
      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your settings have been saved successfully.
        </Alert>
      )}

      {/* Profile Information */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
            Profile Information
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                name="fullName"
                value={userSettings.fullName}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={userSettings.email}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                name="phone"
                value={userSettings.phone}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Organization"
                name="organization"
                value={userSettings.organization}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Location"
                name="location"
                value={userSettings.location}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
            Notification Preferences
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  name="emailNotifications"
                  checked={userSettings.emailNotifications}
                  onChange={handleChange}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Email Notifications
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    Receive updates about your applications via email
                  </Typography>
                </Box>
              }
            />

            <Divider />

            <FormControlLabel
              control={
                <Switch
                  name="smsNotifications"
                  checked={userSettings.smsNotifications}
                  onChange={handleChange}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    SMS Notifications
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    Receive SMS alerts for urgent updates
                  </Typography>
                </Box>
              }
            />

            <Divider />

            <FormControlLabel
              control={
                <Switch
                  name="pushNotifications"
                  checked={userSettings.pushNotifications}
                  onChange={handleChange}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Push Notifications
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    Receive browser notifications for real-time updates
                  </Typography>
                </Box>
              }
            />

            <Divider />

            <FormControlLabel
              control={
                <Switch
                  name="weeklyReports"
                  checked={userSettings.weeklyReports}
                  onChange={handleChange}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Weekly Summary Reports
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    Receive a weekly summary of your applications and certificates
                  </Typography>
                </Box>
              }
            />
          </Box>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
            Security Settings
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              sx={{ borderColor: '#0D47A1', color: '#0D47A1' }}
              fullWidth
            >
              Change Password
            </Button>
            <Button
              variant="outlined"
              sx={{ borderColor: '#0D47A1', color: '#0D47A1' }}
              fullWidth
            >
              Enable Two-Factor Authentication
            </Button>
            <Button
              variant="outlined"
              sx={{ borderColor: '#0D47A1', color: '#0D47A1' }}
              fullWidth
            >
              View Login History
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
            Help & Support
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                sx={{ borderColor: '#0D47A1', color: '#0D47A1' }}
                fullWidth
              >
                View FAQs
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                sx={{ borderColor: '#0D47A1', color: '#0D47A1' }}
                fullWidth
              >
                Contact Support
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                sx={{ borderColor: '#0D47A1', color: '#0D47A1' }}
                fullWidth
              >
                User Guide
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                sx={{ borderColor: '#0D47A1', color: '#0D47A1' }}
                fullWidth
              >
                Report Issue
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 4 }}>
        <Button
          variant="contained"
          sx={{ bgcolor: '#0D47A1' }}
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save Settings
        </Button>
      </Box>

      {/* Footer Note */}
      <Alert severity="info">
        All your settings are encrypted and stored securely. Changes take effect immediately.
      </Alert>
    </Container>
  );
}
