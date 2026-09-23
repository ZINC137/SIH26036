import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Button, Divider, Alert, Chip, Rating,
  FormControl, InputLabel, Select, MenuItem, Stepper, Step, StepLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const COLOR = '#4A148C';
const GRADIENT = 'linear-gradient(135deg, #7B1FA2, #4A148C)';

const steps = ['Inspection Details', 'Measurements', 'Findings & Result', 'Submit'];

export default function FOReport() {
  const [activeStep, setActiveStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState('Pass');

  if (submitted) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Paper elevation={0} sx={{ p: 6, borderRadius: 4, border: '2px solid #4CAF50', textAlign: 'center', maxWidth: 480 }}>
          <CheckCircleIcon sx={{ fontSize: 72, color: '#2E7D32', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Report Submitted!</Typography>
          <Chip label="RPT-2026-048" sx={{ bgcolor: '#F3E5F5', color: COLOR, fontWeight: 700, fontSize: '1rem', px: 2, py: 2.5, mb: 3 }} />
          <Typography variant="body2" sx={{ color: '#757575', mb: 3 }}>
            Your field inspection report has been submitted to the LMO officer for review.
          </Typography>
          <Button variant="contained" sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700 }}
            onClick={() => setSubmitted(false)}>
            Submit Another
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 860, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>FIELD OFFICER PORTAL</Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>Submit Inspection Report</Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E0E0E0' }}>
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}><Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Inspection Details</Typography></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Application ID *" defaultValue="APP-2026-017" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Applicant Name" defaultValue="Singh Fuels" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Inspection Date *" type="date" InputLabelProps={{ shrink: true }} defaultValue="2026-09-23" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Inspection Time *" type="time" InputLabelProps={{ shrink: true }} defaultValue="14:00" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Inspection Address *" defaultValue="Plot 7, Rohini Phase II, Delhi" multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Instrument Type" defaultValue="Fuel Dispenser" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Serial Number" defaultValue="FD-2024-567" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} /></Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}><Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Measurement Readings</Typography></Grid>
            <Grid item xs={12}><Alert severity="info" sx={{ borderRadius: 2 }}>Record the instrument readings at each test point below</Alert></Grid>
            {[['5L', '4.98', '0.02'], ['10L', '9.97', '0.03'], ['20L', '19.95', '0.05'], ['50L', '49.93', '0.07']].map(([point, actual, error]) => (
              <Grid item xs={12} sm={4} key={point}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#F9F9F9', border: '1px solid #E0E0E0' }}>
                  <Typography variant="caption" sx={{ color: '#757575', display: 'block' }}>Test Point: {point}</Typography>
                  <TextField fullWidth label="Actual Reading" defaultValue={actual} size="small" sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  <Typography variant="caption" sx={{ color: '#9E9E9E', mt: 0.5, display: 'block' }}>Error: {error}L</Typography>
                </Paper>
              </Grid>
            ))}
            <Grid item xs={12}><TextField fullWidth label="Environmental Conditions" placeholder="Temperature, humidity, etc." multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} /></Grid>
          </Grid>
        )}

        {activeStep === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}><Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Findings & Result</Typography></Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Inspection Result *</InputLabel>
                <Select value={result} label="Inspection Result *" onChange={(e) => setResult(e.target.value)} sx={{ borderRadius: 2 }}>
                  <MenuItem value="Pass">✅ Pass — Within permissible limits</MenuItem>
                  <MenuItem value="Fail">❌ Fail — Exceeds permissible limits</MenuItem>
                  <MenuItem value="Conditional">⚠️ Conditional — Minor adjustments required</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Observations *" multiline rows={4} placeholder="Describe your findings in detail..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Recommendations" multiline rows={2} placeholder="Any recommendations or follow-up actions..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} /></Grid>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '2px dashed #E0E0E0', textAlign: 'center' }}>
                <UploadFileIcon sx={{ color: '#9E9E9E', fontSize: 40, mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>Attach site photos (max 10 photos)</Typography>
                <Button variant="outlined" component="label" sx={{ borderColor: COLOR, color: COLOR, borderRadius: 2, fontWeight: 600 }}>
                  Upload Photos <input type="file" hidden multiple accept="image/*" />
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Review & Submit</Typography>
            <Alert severity={result === 'Pass' ? 'success' : result === 'Fail' ? 'error' : 'warning'} sx={{ mb: 3, borderRadius: 2 }}>
              <strong>Result: {result}</strong> — Please review all details before submitting.
            </Alert>
            {[['Application ID', 'APP-2026-017'], ['Applicant', 'Singh Fuels'], ['Instrument', 'Fuel Dispenser'], ['Date', '23 Sep 2026'], ['Result', result]].map(([k, v]) => (
              <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid #F0F0F0' }}>
                <Typography variant="body2" sx={{ color: '#757575' }}>{k}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{v}</Typography>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button onClick={() => activeStep === 0 ? null : setActiveStep(s => s - 1)} sx={{ color: '#757575', fontWeight: 600 }}>
            {activeStep === 0 ? '' : 'Back'}
          </Button>
          {activeStep < steps.length - 1
            ? <Button variant="contained" sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700 }} onClick={() => setActiveStep(s => s + 1)}>Next</Button>
            : <Button variant="contained" sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700 }} onClick={() => setSubmitted(true)}>Submit Report</Button>
          }
        </Box>
      </Paper>
    </Box>
  );
}
