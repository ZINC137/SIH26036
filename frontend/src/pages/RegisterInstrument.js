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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const steps = ['Basic Details', 'Specifications', 'Review & Submit'];

const instrumentTypes = [
  'Electronic Scale',
  'Weighing Balance',
  'Pressure Gauge',
  'Temperature Gauge',
  'Flow Meter',
  'Energy Meter',
  'Length Measuring Device',
  'Volume Measuring Device',
];

export default function RegisterInstrument() {
  const [activeStep, setActiveStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    instrumentType: '',
    manufacturerName: '',
    modelNumber: '',
    serialNumber: '',
    yearOfManufacture: new Date().getFullYear(),
    capacity: '',
    unit: 'kg',
    accuracy: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => {
    if (activeStep === 0 && (!formData.instrumentType || !formData.manufacturerName)) {
      alert('Please fill in all required fields');
      return;
    }
    if (activeStep === 1 && (!formData.capacity || !formData.accuracy)) {
      alert('Please fill in all specifications');
      return;
    }
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setActiveStep(0);
      setFormData({
        instrumentType: '',
        manufacturerName: '',
        modelNumber: '',
        serialNumber: '',
        yearOfManufacture: new Date().getFullYear(),
        capacity: '',
        unit: 'kg',
        accuracy: '',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
      });
      setSubmitted(false);
    }, 3000);
  };

  if (submitted) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: '#F5F5F5',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 2 }}>
            Application Submitted Successfully!
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575', mb: 3 }}>
            Your instrument registration application has been submitted.
          </Typography>
          <Card sx={{ mb: 3, border: '2px solid #FF9800' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Application Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    Application ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    APP{Math.floor(Math.random() * 100000)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    Instrument Type
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {formData.instrumentType}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    Submitted Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    Status
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#FF9800' }}>
                    Pending Review
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Typography variant="body2" sx={{ color: '#757575', mb: 2 }}>
            You will receive updates via email. Check your dashboard for status updates.
          </Typography>
          <Button variant="contained" sx={{ bgcolor: '#0D47A1' }} onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
          Register Instrument for Verification
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Complete this form to submit your weighing or measuring instrument for verification.
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Form Content */}
      <Paper sx={{ p: 4, mb: 4 }}>
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
              Step 1: Basic Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Instrument Type</InputLabel>
                  <Select
                    name="instrumentType"
                    value={formData.instrumentType}
                    onChange={handleInputChange}
                    label="Instrument Type"
                  >
                    {instrumentTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Manufacturer Name"
                  name="manufacturerName"
                  value={formData.manufacturerName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Model Number"
                  name="modelNumber"
                  value={formData.modelNumber}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Serial Number"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Year of Manufacture"
                  name="yearOfManufacture"
                  type="number"
                  value={formData.yearOfManufacture}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
              Step 2: Specifications
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  placeholder="e.g., 100"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    label="Unit"
                  >
                    <MenuItem value="kg">Kilogram (kg)</MenuItem>
                    <MenuItem value="g">Gram (g)</MenuItem>
                    <MenuItem value="lb">Pound (lb)</MenuItem>
                    <MenuItem value="l">Litre (L)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Accuracy Class"
                  name="accuracy"
                  value={formData.accuracy}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  placeholder="e.g., Class I, Class II"
                />
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              Please ensure all specifications match your instrument's technical documentation.
            </Alert>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
              Step 3: Review & Contact Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Owner/Applicant Name"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address"
                  name="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            {/* Review Summary */}
            <Card sx={{ mt: 4, bgcolor: '#F5F5F5', border: '2px solid #FF9800' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0D47A1' }}>
                  Application Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#757575' }}>Instrument Type</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formData.instrumentType}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#757575' }}>Manufacturer</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formData.manufacturerName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#757575' }}>Serial Number</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formData.serialNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#757575' }}>Capacity</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formData.capacity} {formData.unit}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          variant="outlined"
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            sx={{ bgcolor: '#0D47A1' }}
            onClick={handleSubmit}
          >
            Submit Application
          </Button>
        ) : (
          <Button
            variant="contained"
            sx={{ bgcolor: '#0D47A1' }}
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </Box>
    </Container>
  );
}
