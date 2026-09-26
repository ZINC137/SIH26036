import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Button, Alert, Chip,
  FormControl, InputLabel, Select, MenuItem, Stepper, Step, StepLabel,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

const COLOR = '#7E22CE';
const GRADIENT = 'linear-gradient(135deg, #A855F7, #7E22CE)';

const steps = ['Select Application', 'Measurement Readings', 'Findings & Seal Stamping', 'Submit'];

export default function FOReport() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [error, setError] = useState('');

  // Selected task
  const [selectedTaskId, setSelectedTaskId] = useState('');

  // Inspection form fields
  const [form, setForm] = useState({
    testError: '0.02',
    envTemp: '25°C, 50% RH',
    securitySealNo: `SEAL-DL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    result: 'Pass',
    notes: 'All load points tested against standard weights. Max Permissible Error within limits.',
    recommendation: 'Recommend periodic re-verification after 1 year.',
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/field-officer/tasks', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks && data.tasks.length > 0) {
          setTasks(data.tasks);
          setSelectedTaskId(data.tasks[0].id);
        }
      })
      .catch(() => setError('Failed to fetch assigned tasks.'))
      .finally(() => setLoadingTasks(false));
  }, []);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  const handleSubmit = async () => {
    if (!selectedTaskId) {
      setError('Please select an application to submit report for.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/field-officer/applications/${selectedTaskId}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          test_error_percentage: form.testError,
          environmental_temp: form.envTemp,
          security_seal_no: form.securitySealNo,
          inspection_result: form.result,
          inspection_notes: `${form.notes} ${form.recommendation ? 'Recommendation: ' + form.recommendation : ''}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmittedReport(data.application);
      } else {
        setError(data.error || 'Failed to submit inspection report.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedReport) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Paper elevation={0} sx={{ p: 6, borderRadius: 4, border: '2px solid #4CAF50', textAlign: 'center', maxWidth: 520 }}>
          <CheckCircleIcon sx={{ fontSize: 72, color: '#2E7D32', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Inspection Dossier Submitted!</Typography>
          <Chip
            label={submittedReport.certificate_no ? `CERT: ${submittedReport.certificate_no}` : `APP: ${submittedReport.app_number}`}
            sx={{ bgcolor: '#F3E5F5', color: COLOR, fontWeight: 800, fontSize: '0.95rem', px: 2, py: 2.5, mb: 3 }}
          />
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            The physical test measurements have been permanently logged. Stamped with security seal{' '}
            <strong>{submittedReport.security_seal_no || 'SEAL-DL-SECURED'}</strong>.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard/field-officer/history')}
              sx={{ borderColor: COLOR, color: COLOR, fontWeight: 700 }}
            >
              View Inspection History
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard/field-officer')}
              sx={{ background: GRADIENT, fontWeight: 700 }}
            >
              Back to Task Roster
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 860, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>
          FIELD OFFICER PORTAL
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E' }}>
          Statutory Verification Dossier
        </Typography>
        <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>
          Record on-ground test results and affix lead/polycarbonate security seals under Rule 11.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E0E0E0' }}>
        {loadingTasks ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: COLOR }} />
          </Box>
        ) : tasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>No Pending Assigned Inspections</Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mt: 1, mb: 3 }}>
              All assigned field verifications have been completed.
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/dashboard/field-officer')} sx={{ borderColor: COLOR, color: COLOR }}>
              Go to Dashboard
            </Button>
          </Box>
        ) : (
          <>
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Select Assigned Task</Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Choose Application from Assigned Roster *</InputLabel>
                    <Select
                      value={selectedTaskId}
                      label="Choose Application from Assigned Roster *"
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                    >
                      {tasks.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.appNumber} — {t.applicant} ({t.instrument}) [S/N: {t.serial}]
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {selectedTask && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Applicant Firm" value={selectedTask.applicant} InputProps={{ readOnly: true }} size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Contact Phone" value={selectedTask.contact} InputProps={{ readOnly: true }} size="small" />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Premises Address" value={selectedTask.address} InputProps={{ readOnly: true }} size="small" multiline rows={2} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Instrument Specification" value={selectedTask.instrument} InputProps={{ readOnly: true }} size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Serial Number" value={selectedTask.serial} InputProps={{ readOnly: true }} size="small" />
                    </Grid>
                  </>
                )}
              </Grid>
            )}

            {activeStep === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Measurement Readings &amp; Tolerances</Typography>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Compare measured load readings against standard reference weights according to Schedule VII.
                  </Alert>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Measured Maximum Error Margin (%) *"
                    value={form.testError}
                    onChange={(e) => setForm({ ...form, testError: e.target.value })}
                    helperText="Tolerable limit <= 0.10% under Section 24"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Testing Temperature &amp; Humidity *"
                    value={form.envTemp}
                    onChange={(e) => setForm({ ...form, envTemp: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#FAFAFA', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 1 }}>
                      STANDARD LOAD TEST MATRIX:
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        ['Quarter Load (25%)', '0.00% error'],
                        ['Half Load (50%)', '+0.01% error'],
                        ['Full Capacity (100%)', '+0.02% error'],
                      ].map(([pt, err]) => (
                        <Grid item xs={4} key={pt}>
                          <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>{pt}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#16A34A' }}>{err}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {activeStep === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Findings &amp; Lead Seal Stamping</Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Statutory Inspection Result *</InputLabel>
                    <Select
                      value={form.result}
                      label="Statutory Inspection Result *"
                      onChange={(e) => setForm({ ...form, result: e.target.value })}
                    >
                      <MenuItem value="Pass">✅ Pass — Complies with Legal Metrology Standards</MenuItem>
                      <MenuItem value="Conditional">⚠️ Conditional — Minor adjustments required</MenuItem>
                      <MenuItem value="Fail">❌ Fail — Exceeds Maximum Permissible Error</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {form.result !== 'Fail' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Lead / Polycarbonate Security Seal Barcode No *"
                      value={form.securitySealNo}
                      onChange={(e) => setForm({ ...form, securitySealNo: e.target.value })}
                      helperText="Official security seal crimped onto the instrument"
                      size="small"
                      sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace' } }}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Official Inspector Observations *"
                    multiline
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Follow-up Recommendations"
                    value={form.recommendation}
                    onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
                    size="small"
                  />
                </Grid>
              </Grid>
            )}

            {activeStep === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Final Verification Summary</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>APPLICATION ID</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{selectedTask?.appNumber}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>APPLICANT</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedTask?.applicant}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>RESULT</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: form.result === 'Pass' ? '#16A34A' : '#B91C1C' }}>
                          {form.result}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>SECURITY SEAL</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                          {form.securitySealNo}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Stepper Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid #EEEEEE' }}>
              <Button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((s) => s - 1)}
                sx={{ color: '#64748B', fontWeight: 600 }}
              >
                Back
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => setActiveStep((s) => s + 1)}
                  sx={{ background: GRADIENT, fontWeight: 700, px: 3 }}
                >
                  Continue →
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting}
                  sx={{ background: GRADIENT, fontWeight: 700, px: 4 }}
                >
                  {submitting ? <CircularProgress size={22} color="inherit" /> : 'Certify & Affix Lead Seal'}
                </Button>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
