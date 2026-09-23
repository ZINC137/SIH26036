import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, MenuItem, Button,
  Stepper, Step, StepLabel, Divider, Alert, Chip, Select, FormControl, InputLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

const COLOR = '#E65100';
const GRADIENT = 'linear-gradient(135deg, #FF6D00, #E65100)';

const INSTRUMENT_TYPES = [
  'Weighing Scale (Capacity ≤ 5kg)',
  'Weighing Scale (5kg - 50kg)',
  'Platform Balance (50kg - 500kg)',
  'Fuel Dispenser',
  'Moisture Meter',
  'Pressure Gauge',
  'Water Flow Meter',
  'Counter Scale',
  'Crane Scale',
  'Other',
];

const STATES = ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore', 'Hyderabad', 'Pune', 'Jaipur', 'Lucknow', 'Ahmedabad'];

const steps = ['Instrument Details', 'Business Info', 'Upload Documents', 'Review & Submit'];

export default function UserApply() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    instrumentType: '', make: '', model: '', serialNo: '', capacity: '', unit: 'kg',
    businessName: '', gstNo: '', address: '', city: '', state: '', pincode: '',
    contactName: '', contactPhone: '', contactEmail: '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Paper elevation={0} sx={{ p: 6, borderRadius: 4, border: '2px solid #4CAF50', textAlign: 'center', maxWidth: 480 }}>
          <CheckCircleIcon sx={{ fontSize: 72, color: '#2E7D32', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 1 }}>Application Submitted!</Typography>
          <Typography variant="body1" sx={{ color: '#616161', mb: 2 }}>Your application has been submitted successfully.</Typography>
          <Chip label="APP-2026-025" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700, fontSize: '1rem', px: 2, py: 2.5, mb: 3 }} />
          <Typography variant="body2" sx={{ color: '#757575', mb: 3 }}>
            You will receive a confirmation email. An LMO officer will review your application within 3-5 business days.
          </Typography>
          <Button variant="contained" sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700 }}
            onClick={() => navigate('/dashboard/user/applications')}>
            Track My Application
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>USER PORTAL</Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>New Verification Application</Typography>
        <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>Apply for instrument verification under the Legal Metrology Act, 2009</Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E0E0E0' }}>
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1A1A2E' }}>Instrument Details</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Instrument Type *</InputLabel>
                  <Select value={form.instrumentType} label="Instrument Type *" onChange={set('instrumentType')}>
                    {INSTRUMENT_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Make / Brand *" value={form.make} onChange={set('make')} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Model Number" value={form.model} onChange={set('model')} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Serial Number *" value={form.serialNo} onChange={set('serialNo')} />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField fullWidth label="Capacity *" value={form.capacity} onChange={set('capacity')} type="number" />
              </Grid>
              <Grid item xs={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select value={form.unit} label="Unit" onChange={set('unit')}>
                    {['kg', 'g', 'L', 'mL', 'bar', 'm³/h'].map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1A1A2E' }}>Business Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Business / Shop Name *" value={form.businessName} onChange={set('businessName')} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="GST Number" value={form.gstNo} onChange={set('gstNo')} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Address *" value={form.address} onChange={set('address')} multiline rows={2} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="City *" value={form.city} onChange={set('city')} />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>State *</InputLabel>
                  <Select value={form.state} label="State *" onChange={set('state')}>
                    {STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Pincode *" value={form.pincode} onChange={set('pincode')} />
              </Grid>
              <Grid item xs={12}><Divider><Typography variant="caption" color="text.secondary">Contact Person</Typography></Divider></Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Contact Name *" value={form.contactName} onChange={set('contactName')} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Phone *" value={form.contactPhone} onChange={set('contactPhone')} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Email *" value={form.contactEmail} onChange={set('contactEmail')} />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1A1A2E' }}>Upload Documents</Typography>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Please upload clear scanned copies. Accepted formats: PDF, JPG, PNG (max 5MB each)
            </Alert>
            <Grid container spacing={3}>
              {['Business Registration Certificate', 'GST Certificate', 'Previous Verification Certificate (if any)', 'Instrument Photograph'].map((doc) => (
                <Grid item xs={12} key={doc}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '2px dashed #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{doc}</Typography>
                      <Typography variant="caption" sx={{ color: '#757575' }}>PDF, JPG, PNG — max 5MB</Typography>
                    </Box>
                    <Button variant="outlined" size="small" component="label" sx={{ borderColor: COLOR, color: COLOR, fontWeight: 600, borderRadius: 2 }}>
                      Choose File
                      <input type="file" hidden />
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1A1A2E' }}>Review & Submit</Typography>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>Please review your application before submitting.</Alert>
            <Grid container spacing={2}>
              {[
                ['Instrument Type', form.instrumentType || 'Platform Balance (200kg)'],
                ['Make / Model', `${form.make || 'Avery Weigh-Tronix'} / ${form.model || 'WM-500'}`],
                ['Serial Number', form.serialNo || 'AWT-2024-00123'],
                ['Capacity', `${form.capacity || '200'} ${form.unit}`],
                ['Business Name', form.businessName || 'Raj Traders'],
                ['GST Number', form.gstNo || '07AAACR5055K1Z1'],
                ['Address', form.address || '14 Karol Bagh, New Delhi'],
                ['Contact', form.contactName || 'Rajesh Sharma'],
              ].map(([k, v]) => (
                <Grid item xs={12} sm={6} key={k}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FAFAFA', border: '1px solid #F0F0F0' }}>
                    <Typography variant="caption" sx={{ color: '#757575', display: 'block' }}>{k}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1A2E' }}>{v}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button onClick={() => activeStep === 0 ? navigate('/dashboard/user') : setActiveStep(s => s - 1)}
            sx={{ color: '#757575', fontWeight: 600 }}>
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          {activeStep < steps.length - 1
            ? <Button variant="contained" sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700 }} onClick={() => setActiveStep(s => s + 1)}>Next</Button>
            : <Button variant="contained" sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700 }} onClick={handleSubmit}>Submit Application</Button>
          }
        </Box>
      </Paper>
    </Box>
  );
}
