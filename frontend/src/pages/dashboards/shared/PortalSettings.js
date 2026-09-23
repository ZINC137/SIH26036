import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, TextField, Button, Divider, Switch, FormControlLabel, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const ROLE_META = {
  user:         { label: 'Public User',   color: '#E65100', gradient: 'linear-gradient(135deg, #FF6D00, #E65100)' },
  lmo:          { label: 'LMO Officer',   color: '#1B5E20', gradient: 'linear-gradient(135deg, #2E7D32, #1B5E20)' },
  field_officer:{ label: 'Field Officer', color: '#4A148C', gradient: 'linear-gradient(135deg, #7B1FA2, #4A148C)' },
  admin:        { label: 'Administrator', color: '#B71C1C', gradient: 'linear-gradient(135deg, #C62828, #B71C1C)' },
};

export default function PortalSettings({ userRole = 'user', userEmail = '' }) {
  const meta = ROLE_META[userRole] || ROLE_META.user;
  const [saved, setSaved] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 720, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: meta.color, fontWeight: 700, letterSpacing: 1.5 }}>{meta.label.toUpperCase()} PORTAL</Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>Settings</Typography>
      </Box>

      {saved && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSaved(false)}>Settings saved successfully!</Alert>}

      {/* Profile */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E0E0E0', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Profile Information</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Full Name" defaultValue="Priyanshu Gupta" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Email Address" value={userEmail} disabled sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Phone Number" defaultValue="+91 98765 43210" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Organization" defaultValue="Legal Metrology Dept." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
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
          <Grid item xs={12}><TextField fullWidth label="Current Password" type="password" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="New Password" type="password" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Confirm New Password" type="password" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} /></Grid>
        </Grid>
      </Paper>

      <Button variant="contained" startIcon={<SaveIcon />} size="large"
        sx={{ background: meta.gradient, borderRadius: 2, fontWeight: 700, px: 4 }}
        onClick={() => setSaved(true)}>
        Save Changes
      </Button>
    </Box>
  );
}
