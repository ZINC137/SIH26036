import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CloseIcon from '@mui/icons-material/Close';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

const COLOR = '#0D9488';
const GRADIENT = 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)';

export default function GATCQueue({ userEmail }) {
  const [tasks, setTasks] = useState([]);
  const [taskSearch, setTaskSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Inspection Modal State
  const [inspectModal, setInspectModal] = useState({
    open: false,
    task: null,
    testError: '0.012',
    envTemp: '23°C, 45% RH (Controlled Lab)',
    workingStandards: 'NABL Traceable Class M1/E2 Weights (Ref: NPL/CAL/2025/11)',
    testObservations: '',
    securitySealNo: '',
    result: 'Pass',
    notes: 'Laboratory verification test completed according to Legal Metrology General Rules.',
    file: null,
    submitting: false,
  });

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/gatc/tasks', { credentials: 'include' });
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      } else {
        setTasks([]);
      }
    } catch {
      setError('Unable to load GATC testing queue from backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenInspect = (task) => {
    setInspectModal({
      open: true,
      task,
      testError: '0.012',
      envTemp: '23°C, 45% RH (Controlled Lab)',
      workingStandards: 'NABL Traceable Class M1/E2 Weights (Ref: NPL/CAL/2025/11)',
      testObservations: `Repeatability Test: Within 0.01%. Zero load error: 0.00%. Eccentricity: Pass. Tested at 25%, 50%, 100% capacity of ${task.capacity}.`,
      securitySealNo: `GATC-SEAL-${Math.floor(100000 + Math.random() * 900000)}`,
      result: 'Pass',
      notes: `Verified against working standards. MPE is within permissible limits for ${task.instrumentType}. Tamper-proof polycarbonate GATC seal affixed.`,
      file: null,
      submitting: false,
    });
  };

  const handleConfirmInspect = async (e) => {
    e.preventDefault();
    if (!inspectModal.task) return;

    setInspectModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/gatc/applications/${inspectModal.task.id}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          test_error_percentage: inspectModal.testError,
          environmental_temp: inspectModal.envTemp,
          working_standards_used: inspectModal.workingStandards,
          test_observations: inspectModal.testObservations,
          security_seal_no: inspectModal.securitySealNo,
          inspection_result: inspectModal.result,
          inspection_notes: inspectModal.notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (inspectModal.file) {
          const formData = new FormData();
          formData.append('file', inspectModal.file);
          formData.append('doc_type', 'GATC_TEST_REPORT');
          formData.append('application_id', inspectModal.task.id);
          await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });
        }

        setSuccess(`GATC Verification Report submitted! Test observations and seal details forwarded to LMO for statutory Form D endorsement.`);
        setInspectModal({ open: false, task: null, testError: '', envTemp: '', workingStandards: '', testObservations: '', securitySealNo: '', result: 'Pass', notes: '', file: null, submitting: false });
        fetchTasks();
      } else {
        setError(data.error || 'Failed to submit GATC test report.');
      }
    } catch {
      setError('Communication failure with test centre service.');
    } finally {
      setInspectModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const filteredTasks = tasks.filter((t) =>
    t.appNumber?.toLowerCase().includes(taskSearch.toLowerCase()) ||
    t.businessName?.toLowerCase().includes(taskSearch.toLowerCase()) ||
    t.serialNo?.toLowerCase().includes(taskSearch.toLowerCase()) ||
    t.instrumentType?.toLowerCase().includes(taskSearch.toLowerCase())
  );

  return (
    <Box sx={{ pb: 4 }}>
      {/* ── Header Banner ── */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
            <Chip
              icon={<PendingActionsRoundedIcon sx={{ fontSize: '14px !important' }} />}
              label="TESTING QUEUE"
              size="small"
              sx={{
                bgcolor: '#F0FDFA',
                color: COLOR,
                border: '1px solid #99F6E4',
                fontWeight: 800,
                fontSize: '0.68rem',
                borderRadius: '6px',
              }}
            />
            <Chip
              label={`${tasks.length} INSTRUMENTS PENDING`}
              size="small"
              sx={{
                bgcolor: tasks.length > 0 ? '#FEF3C7' : '#F0FDF4',
                color: tasks.length > 0 ? '#B45309' : '#15803D',
                border: `1px solid ${tasks.length > 0 ? '#FDE68A' : '#BBF7D0'}`,
                fontWeight: 800,
                fontSize: '0.68rem',
                borderRadius: '6px',
              }}
            />
          </Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, color: '#0F172A', fontSize: { xs: '1.5rem', sm: '1.9rem' } }}
          >
            Allocated Testing Queue
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Statutory high-capacity &amp; specialized instruments allocated by Legal Metrology Officers for laboratory testing
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={fetchTasks}
            sx={{ borderColor: '#E2E8F0', color: '#475569', fontWeight: 700 }}
          >
            Refresh Queue
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* ── Testing Queue Table Paper ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Instruments Ready for Laboratory Verification ({filteredTasks.length})
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Verify Maximum Permissible Error (MPE), zero load stability, and affix statutory GATC security seals
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="Search by App ID, serial, applicant..."
            value={taskSearch}
            onChange={(e) => setTaskSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
            }}
            sx={{ minWidth: { xs: '100%', sm: 280 } }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: COLOR }} /></Box>
        ) : filteredTasks.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <ScienceRoundedIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 1.5 }} />
            <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 600 }}>
              {taskSearch ? 'No matching instruments found in testing queue.' : 'No instruments currently pending in testing queue.'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              When Legal Metrology Officers allocate specialized instruments to this centre, they will appear here.
            </Typography>
          </Box>
        ) : (
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>APPLICATION NO.</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>APPLICANT / BUSINESS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>INSTRUMENT SPECIFICATION</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>SERIAL NO.</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>SCHEDULED DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell sx={{ fontWeight: 800, color: COLOR }}>{t.appNumber}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{t.businessName}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>{t.contactName} ({t.contactPhone})</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.instrumentType}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>{t.make} · Capacity: {t.capacity}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.serialNo}</TableCell>
                  <TableCell>
                    <Chip label={`${t.scheduledDate} ${t.scheduledTime}`} size="small" sx={{ bgcolor: '#F1F5F9', fontWeight: 600, fontSize: '0.72rem' }} />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ScienceRoundedIcon />}
                      onClick={() => handleOpenInspect(t)}
                      sx={{
                        background: GRADIENT,
                        fontWeight: 700,
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        px: 2,
                      }}
                    >
                      Record Test
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* ── RECORD INSPECTION / TEST REPORT MODAL ── */}
      <Dialog
        open={inspectModal.open}
        onClose={() => !inspectModal.submitting && setInspectModal((prev) => ({ ...prev, open: false }))}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLOR }}>
              <ScienceRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Record GATC Laboratory Test</Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Application: <strong>{inspectModal.task?.appNumber}</strong> &nbsp;|&nbsp; Instrument: <strong>{inspectModal.task?.instrumentType}</strong>
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setInspectModal((prev) => ({ ...prev, open: false }))}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleConfirmInspect}>
          <DialogContent dividers sx={{ pt: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 2 }}>
              <TextField
                label="Maximum Permissible Error / Test Error (%)"
                value={inspectModal.testError}
                onChange={(e) => setInspectModal((prev) => ({ ...prev, testError: e.target.value }))}
                required
                fullWidth
                helperText="Statutory limit: usually ±0.05% for Class III"
              />

              <TextField
                label="Environmental Conditions / Temp"
                value={inspectModal.envTemp}
                onChange={(e) => setInspectModal((prev) => ({ ...prev, envTemp: e.target.value }))}
                required
                fullWidth
                helperText="e.g. 23°C, 45% RH (Controlled Lab)"
              />

              <TextField
                label="NABL Working Standards Utilized"
                value={inspectModal.workingStandards}
                onChange={(e) => setInspectModal((prev) => ({ ...prev, workingStandards: e.target.value }))}
                required
                fullWidth
                helperText="Reference standard calibration certificate details"
              />

              <TextField
                label="Tamper-Proof GATC Security Seal No."
                value={inspectModal.securitySealNo}
                onChange={(e) => setInspectModal((prev) => ({ ...prev, securitySealNo: e.target.value }))}
                required
                fullWidth
                helperText="Barcoded physical seal affixed to instrument calibration point"
              />
            </Box>

            <FormControl fullWidth sx={{ mb: 2.5 }}>
              <InputLabel>Verification Result</InputLabel>
              <Select
                value={inspectModal.result}
                label="Verification Result"
                onChange={(e) => setInspectModal((prev) => ({ ...prev, result: e.target.value }))}
              >
                <MenuItem value="Pass">Pass — Conforms to Legal Metrology Standards</MenuItem>
                <MenuItem value="Fail">Fail — Exceeds Maximum Permissible Error</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Standard Test Observations"
              value={inspectModal.testObservations}
              onChange={(e) => setInspectModal((prev) => ({ ...prev, testObservations: e.target.value }))}
              multiline
              rows={2}
              fullWidth
              sx={{ mb: 2.5 }}
              helperText="Observations during repeatability, eccentricity, and hysteresis testing"
            />

            <TextField
              label="Laboratory Recommendations &amp; Officer Notes"
              value={inspectModal.notes}
              onChange={(e) => setInspectModal((prev) => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={2}
              fullWidth
              sx={{ mb: 2.5 }}
            />

            <Box sx={{ p: 2, borderRadius: '12px', border: '1.5px dashed #CBD5E1', bgcolor: '#F8FAFC', textAlign: 'center' }}>
              <UploadFileRoundedIcon sx={{ fontSize: 32, color: COLOR, mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                Attach Official GATC Calibration &amp; Test Certificate (PDF)
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5 }}>
                Optional signed laboratory test report with graphical calibration curves
              </Typography>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                id="gatc-test-file"
                style={{ display: 'none' }}
                onChange={(e) => setInspectModal((prev) => ({ ...prev, file: e.target.files[0] }))}
              />
              <label htmlFor="gatc-test-file">
                <Button variant="outlined" component="span" size="small" sx={{ borderColor: COLOR, color: COLOR }}>
                  {inspectModal.file ? inspectModal.file.name : 'Choose File'}
                </Button>
              </label>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={() => setInspectModal((prev) => ({ ...prev, open: false }))}
              disabled={inspectModal.submitting}
              sx={{ color: '#64748B' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={inspectModal.submitting}
              startIcon={inspectModal.submitting ? <CircularProgress size={16} /> : <CheckCircleRoundedIcon />}
              sx={{
                background: GRADIENT,
                fontWeight: 700,
                px: 3,
                borderRadius: '8px',
              }}
            >
              {inspectModal.submitting ? 'Submitting Report...' : 'Submit GATC Verification Report'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
