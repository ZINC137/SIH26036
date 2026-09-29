import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Button, Alert, Chip,
  FormControl, InputLabel, Select, MenuItem, Stepper, Step, StepLabel,
  CircularProgress, IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useNavigate } from 'react-router-dom';
import API_BASE, { authFetch } from '../../../config/api';

const COLOR = '#7E22CE';
const GRADIENT = 'linear-gradient(135deg, #A855F7, #7E22CE)';

const steps = ['Select Application', 'Measurement Readings', 'Findings & Seal Stamping', 'Inspection Photos & Evidence', 'Submit'];

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

  // Attached evidence photos
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
    authFetch('/api/field-officer/tasks')
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

  const handlePhotoUpload = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedTaskId) {
      setError('Please select an assigned application first.');
      return;
    }
    setUploadingPhoto(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', docType || 'INSPECTION_PHOTO');
      formData.append('application_id', selectedTaskId);

      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.document) {
        setUploadedPhotos((prev) => [...prev, data.document]);
      } else {
        setError(data.error || 'Failed to upload photo.');
      }
    } catch {
      setError('Failed to upload file to server.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const removePhoto = async (id) => {
    try {
      const res = await authFetch(`/api/upload/${id}/application/${selectedTaskId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to detach inspection evidence.');
        return;
      }
      setUploadedPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError('Failed to detach inspection evidence.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedTaskId) {
      setError('Please select an application to submit report for.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await authFetch(`/api/field-officer/applications/${selectedTaskId}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_error_percentage: form.testError,
          environmental_temp: form.envTemp,
          security_seal_no: form.securitySealNo,
          inspection_result: form.result,
          inspection_notes: `${form.notes} ${form.recommendation ? 'Recommendation: ' + form.recommendation : ''}`,
          document_ids: uploadedPhotos.map((p) => p.id),
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
        <Paper elevation={0} sx={{ p: 6, borderRadius: 4, border: '2px solid #4CAF50', textAlign: 'center', maxWidth: 560 }}>
          <CheckCircleIcon sx={{ fontSize: 72, color: '#2E7D32', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Inspection Report Submitted!</Typography>
          <Chip
            label={`APP: ${submittedReport.app_number}`}
            sx={{ bgcolor: '#F3E5F5', color: COLOR, fontWeight: 800, fontSize: '0.95rem', px: 2, py: 2.5, mb: 3 }}
          />
          <Typography variant="body1" sx={{ color: '#1A1A2E', fontWeight: 700, mb: 1 }}>
            📋 Report forwarded to LMO for statutory signing
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
            Your on-site inspection findings have been permanently logged with security seal{' '}
            <strong>{submittedReport.security_seal_no || 'Recorded'}</strong>.
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            Per Section 24 of the Legal Metrology Act, 2009, the gazetted LMO will now review your report,
            sign it with their Class-3 DSC, and issue the official Verification Certificate.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard/field-officer/history')}
              sx={{ borderColor: COLOR, color: COLOR, fontWeight: 700 }}
            >
              View My Reports
            </Button>
            <Button
              variant="contained"
              onClick={() => { setSubmittedReport(null); setActiveStep(0); }}
              sx={{ background: GRADIENT, fontWeight: 700 }}
            >
              New Inspection
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
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    📸 Inspection Photographs &amp; Statutory Evidence
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                    Upload physical evidence captured on-site. The gazetted LMO reviews these high-resolution images before approving and issuing the legal stamping certificate.
                  </Typography>
                </Grid>

                {/* Upload action cards */}
                {[
                  {
                    type: 'INSPECTION_PHOTO',
                    title: 'Instrument On-Site Photo',
                    desc: 'Full photo showing the instrument in place with model/serial markings.',
                    icon: <PhotoCameraIcon sx={{ fontSize: 32, color: COLOR }} />,
                  },
                  {
                    type: 'SEAL_PHOTO',
                    title: 'Security Seal Affixed Photo',
                    desc: 'Clear close-up photograph of the crimped lead/polycarbonate seal.',
                    icon: <CheckCircleIcon sx={{ fontSize: 32, color: '#16A34A' }} />,
                  },
                  {
                    type: 'TEST_OBSERVATION_SHEET',
                    title: 'Test Observation Sheet / Report',
                    desc: 'Field worksheet recording Schedule VII load points and test weights.',
                    icon: <InsertDriveFileIcon sx={{ fontSize: 32, color: '#0284C7' }} />,
                  },
                ].map((card) => (
                  <Grid item xs={12} sm={4} key={card.type}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 2.5,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '1.5px dashed #CBD5E1',
                        bgcolor: '#FAFAFA',
                        '&:hover': { bgcolor: '#F8FAFC', borderColor: COLOR },
                      }}
                    >
                      <Box>
                        <Box sx={{ mb: 1 }}>{card.icon}</Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                          {card.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>
                          {card.desc}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        component="label"
                        size="small"
                        disabled={uploadingPhoto}
                        startIcon={<CloudUploadIcon />}
                        sx={{ borderColor: COLOR, color: COLOR, fontWeight: 700, textTransform: 'none' }}
                      >
                        {uploadingPhoto ? 'Uploading...' : 'Choose / Capture Photo'}
                        <input
                          type="file"
                          hidden
                          accept="image/*,application/pdf"
                          onChange={(e) => handlePhotoUpload(e, card.type)}
                        />
                      </Button>
                    </Paper>
                  </Grid>
                ))}

                {/* Uploaded Photos Gallery */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, mt: 1 }}>
                    Uploaded Evidence Dossier ({uploadedPhotos.length} files attached)
                  </Typography>
                  {uploadedPhotos.length === 0 ? (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      No photos attached yet. It is strongly advised to upload at least the <strong>Lead Seal Photo</strong> and <strong>Instrument Photo</strong> for statutory verification.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {uploadedPhotos.map((photo) => (
                        <Grid item xs={12} sm={4} md={3} key={photo.id}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              position: 'relative',
                              textAlign: 'center',
                              bgcolor: '#FFFFFF',
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => removePhoto(photo.id)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                color: '#EF4444',
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                '&:hover': { bgcolor: '#FEE2E2' },
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                            {photo.mime_type?.startsWith('image/') ? (
                              <img
                                src={`${API_BASE}${photo.file_path}`}
                                alt={photo.file_name}
                                style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 4 }}
                              />
                            ) : (
                              <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <InsertDriveFileIcon sx={{ fontSize: 48, color: '#64748B' }} />
                              </Box>
                            )}
                            <Chip
                              label={photo.doc_type?.replace(/_/g, ' ')}
                              size="small"
                              sx={{ mt: 1, fontSize: '0.65rem', fontWeight: 700 }}
                            />
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#64748B' }} noWrap>
                              {photo.file_name}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Grid>
              </Grid>
            )}

            {activeStep === 4 && (
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
                      <Grid item xs={12}>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>STATUTORY EVIDENCE ATTACHED</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: uploadedPhotos.length > 0 ? '#16A34A' : '#D97706' }}>
                          {uploadedPhotos.length > 0 ? `✅ ${uploadedPhotos.length} photograph(s) / document(s) attached for LMO scrutiny` : '⚠️ No photographs attached'}
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
