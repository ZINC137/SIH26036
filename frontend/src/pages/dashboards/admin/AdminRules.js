import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Chip, Button, Table, TableBody,
  TableCell, TableHead, TableRow, Tabs, Tab, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, CircularProgress,
  Divider
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import RuleIcon from '@mui/icons-material/Rule';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ScienceIcon from '@mui/icons-material/Science';
import RefreshIcon from '@mui/icons-material/Refresh';

const COLOR = '#B91C1C';

export default function AdminRules() {
  const [tab, setTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [ruleSets, setRuleSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected category for schema inspect
  const [selectedCat, setSelectedCat] = useState(null);

  // New Version Dialog
  const [versionModal, setVersionModal] = useState({
    open: false,
    ruleSet: null,
    sourceDocument: '',
    sourceReference: '',
    sourceNotification: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    notes: '',
    submitting: false,
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [catsRes, rulesRes] = await Promise.all([
        fetch('http://localhost:5000/api/rules/categories'),
        fetch('http://localhost:5000/api/rules/admin/rulesets', { credentials: 'include' }),
      ]);

      const catsData = await catsRes.json();
      const rulesData = await rulesRes.json();

      if (catsData.categories) setCategories(catsData.categories);
      if (rulesData.ruleSets) setRuleSets(rulesData.ruleSets);
    } catch (err) {
      setError('Failed to fetch legal metrology rule configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenVersionModal = (rs) => {
    setVersionModal({
      open: true,
      ruleSet: rs,
      sourceDocument: rs.source_document || '',
      sourceReference: rs.source_reference || '',
      sourceNotification: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      notes: `Revision following statutory gazette amendment to ${rs.code}.`,
      submitting: false,
    });
  };

  const handleCreateVersion = async (e) => {
    e.preventDefault();
    setVersionModal((prev) => ({ ...prev, submitting: true }));
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`http://localhost:5000/api/rules/admin/rulesets/${versionModal.ruleSet.id}/version`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sourceDocument: versionModal.sourceDocument,
          sourceReference: versionModal.sourceReference,
          sourceNotification: versionModal.sourceNotification,
          effectiveFrom: versionModal.effectiveFrom,
          notes: versionModal.notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`New Rule Version ${data.ruleSet.version} created successfully! Previous version marked as SUPERSEDED.`);
        setVersionModal({ open: false, ruleSet: null });
        fetchData();
      } else {
        setError(data.error || 'Failed to create new rule version.');
        setVersionModal((prev) => ({ ...prev, submitting: false }));
      }
    } catch {
      setError('Network error while creating rule version.');
      setVersionModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const centralGatcCount = categories.filter((c) => c.is_gatc_eligible && c.jurisdiction_type !== 'STATE').length;
  const stateCustomCount = categories.filter((c) => c.jurisdiction_type === 'STATE').length;
  const lmoReservedCount = categories.filter((c) => !c.is_gatc_eligible).length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <GavelIcon sx={{ color: COLOR, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1A1A2E' }}>
              Legal Metrology Rule Configuration & Authority Matrix
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Source of Truth: Legal Metrology Act, 2009 · General Rules, 2011 · GATC Rules, 2013 (Amended 2026 First Schedule)
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          sx={{ borderColor: '#E2E8F0', color: '#1E293B', textTransform: 'none', fontWeight: 600 }}
        >
          Reload Rules
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Statutory Status Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FEF2F2' }}>
            <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Central GATC Eligible
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#B91C1C', mt: 0.5 }}>
              {centralGatcCount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#7F1D1D', display: 'block', mt: 0.5 }}>
              G.S.R. 346(E) First Schedule
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#F0FDF4' }}>
            <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              LMO Reserved Stamping
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#15803D', mt: 0.5 }}>
              {lmoReservedCount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#14532D', display: 'block', mt: 0.5 }}>
              Precision Balances / Taximeters
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#EFF6FF' }}>
            <Typography variant="caption" sx={{ color: '#1E40AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              State Custom Schedules
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1D4ED8', mt: 0.5 }}>
              {stateCustomCount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#1E3A8A', display: 'block', mt: 0.5 }}>
              State Enforcement Rules (e.g. MH)
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FAF5FF' }}>
            <Typography variant="caption" sx={{ color: '#6B21A8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Active Rule Sets
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#7E22CE', mt: 0.5 }}>
              {ruleSets.filter((r) => r.status === 'ACTIVE').length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#581C87', display: 'block', mt: 0.5 }}>
              Versioning & Frozen Snapshots
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, nv) => setTab(nv)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: '1px solid #E2E8F0', px: 2 }}
        >
          <Tab icon={<RuleIcon />} iconPosition="start" label="Instrument Categories & Schemas" sx={{ fontWeight: 700 }} />
          <Tab icon={<ScienceIcon />} iconPosition="start" label="Authority Eligibility Matrix (LMO / GATC)" sx={{ fontWeight: 700 }} />
          <Tab icon={<HistoryEduIcon />} iconPosition="start" label="Rule Sets & Statutory Versioning" sx={{ fontWeight: 700 }} />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress sx={{ color: COLOR }} />
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            {/* TAB 0: CATEGORIES & SCHEMAS */}
            {tab === 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: '#0F172A' }}>
                  Registered Legal Metrology Categories ({categories.length} Total)
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                  Configured categories define dynamic application fields, document requirements, mandatory on-site inspection checks, and verification test specifications.
                </Typography>

                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Instrument Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Jurisdiction</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Legal Authority Scope</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Statutory Source</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map((c) => (
                      <TableRow key={c.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                          {c.code}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {c.name}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={c.jurisdiction_type === 'STATE' ? `State (${c.state_code})` : 'Central'}
                            sx={{
                              bgcolor: c.jurisdiction_type === 'STATE' ? '#FEF3C7' : '#EFF6FF',
                              color: c.jurisdiction_type === 'STATE' ? '#92400E' : '#1D4ED8',
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {c.is_gatc_eligible ? (
                            <Chip
                              size="small"
                              label="LMO + GATC Allowed"
                              sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700 }}
                            />
                          ) : (
                            <Chip
                              size="small"
                              label="LMO Only (Field Stamping)"
                              sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 700 }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                          {c.source_document || 'Legal Metrology Act, 2009'} ({c.source_rule || 'Sec 24'})
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setSelectedCat(c)}
                            sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#CBD5E1' }}
                          >
                            Inspect Schema
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}

            {/* TAB 1: AUTHORITY MATRIX */}
            {tab === 1 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: '#0F172A' }}>
                  Statutory Authority Eligibility Matrix (Rule 3(1) & First Schedule)
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                  In accordance with the 2025 and 2026 amendments to the Legal Metrology (GATC) Rules, 2013, GATC laboratory verification is legally permitted for 23 categories in the First Schedule. GATC eligibility is NOT mandatory assignment; final allocation is governed by operational availability and departmental assignment.
                </Typography>

                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Instrument Category</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>LMO Permitted</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>GATC Permitted</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Statutory Legal Basis</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Statutory Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map((c, idx) => (
                      <TableRow key={c.id} hover>
                        <TableCell sx={{ color: '#94A3B8' }}>{idx + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {c.name}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip size="small" label="YES" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800 }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {c.is_gatc_eligible ? (
                            <Chip size="small" label="YES (Permitted)" sx={{ bgcolor: '#DBEAFE', color: '#1E40AF', fontWeight: 800 }} />
                          ) : (
                            <Chip size="small" label="NO (LMO Only)" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 700 }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: '#475569' }}>
                          {c.source_notification || c.source_document}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                          {c.is_gatc_eligible
                            ? 'Either GATC laboratory testing or LMO field inspection legally allowed.'
                            : 'Reserved for gazetted Legal Metrology Officers.'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}

            {/* TAB 2: RULE SETS & VERSIONING */}
            {tab === 2 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      Rule Sets & Version Control Registry
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      Statutory Rule Immutability: When regulations change, a new version is created. Historical verification certificates permanently retain the exact rule version in effect on application date.
                    </Typography>
                  </Box>
                </Box>

                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Rule Code</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Rule Set Title</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Version</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Effective Period</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Source Notification</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Version Control</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ruleSets.map((rs) => (
                      <TableRow key={rs.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{rs.code}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{rs.name}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip size="small" label={`v${rs.version}`} sx={{ fontWeight: 800 }} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={rs.status}
                            sx={{
                              bgcolor:
                                rs.status === 'ACTIVE'
                                  ? '#DCFCE7'
                                  : rs.status === 'SCHEDULED'
                                  ? '#FEF3C7'
                                  : rs.status === 'SUPERSEDED'
                                  ? '#F1F5F9'
                                  : '#FEE2E2',
                              color:
                                rs.status === 'ACTIVE'
                                  ? '#166534'
                                  : rs.status === 'SCHEDULED'
                                  ? '#92400E'
                                  : rs.status === 'SUPERSEDED'
                                  ? '#64748B'
                                  : '#991B1B',
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: '#475569' }}>
                          {new Date(rs.effective_from).toLocaleDateString()} —{' '}
                          {rs.effective_to ? new Date(rs.effective_to).toLocaleDateString() : 'Current (Open)'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                          {rs.source_notification || rs.source_document}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {rs.status === 'ACTIVE' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<AddCircleIcon />}
                              onClick={() => handleOpenVersionModal(rs)}
                              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                            >
                              Create Version
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* ── CREATE NEW RULE VERSION MODAL ── */}
      <Dialog open={versionModal.open} onClose={() => setVersionModal({ open: false, ruleSet: null })} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateVersion}>
          <DialogTitle sx={{ fontWeight: 800, color: '#1A1A2E' }}>
            Create New Rule Version (Statutory Amendment)
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Statutory Immutability Guarantee: Creating a new version increments the version number to{' '}
              <strong>v{(versionModal.ruleSet?.version || 1) + 1}</strong> and marks version {versionModal.ruleSet?.version} as{' '}
              <strong>SUPERSEDED</strong>. Prior applications permanently retain their original rule version.
            </Alert>

            <TextField
              fullWidth
              size="small"
              label="Source Legal Document *"
              value={versionModal.sourceDocument}
              onChange={(e) => setVersionModal({ ...versionModal, sourceDocument: e.target.value })}
              required
            />
            <TextField
              fullWidth
              size="small"
              label="Statutory Rule / Schedule Reference *"
              value={versionModal.sourceReference}
              onChange={(e) => setVersionModal({ ...versionModal, sourceReference: e.target.value })}
              required
            />
            <TextField
              fullWidth
              size="small"
              label="Official Gazette Notification Number *"
              value={versionModal.sourceNotification}
              onChange={(e) => setVersionModal({ ...versionModal, sourceNotification: e.target.value })}
              placeholder="e.g. G.S.R. 779(E) dated 23-10-2025"
              required
            />
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Effective Commencement Date *"
              value={versionModal.effectiveFrom}
              onChange={(e) => setVersionModal({ ...versionModal, effectiveFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Amendment Notes & Legal Justification"
              value={versionModal.notes}
              onChange={(e) => setVersionModal({ ...versionModal, notes: e.target.value })}
            />
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setVersionModal({ open: false, ruleSet: null })} sx={{ color: '#64748B' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={versionModal.submitting}
              sx={{ bgcolor: COLOR, '&:hover': { bgcolor: '#991B1B' }, fontWeight: 700 }}
            >
              {versionModal.submitting ? 'Creating Version...' : 'Publish & Increment Version'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── INSPECT CATEGORY SCHEMA MODAL ── */}
      <Dialog open={!!selectedCat} onClose={() => setSelectedCat(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#1A1A2E' }}>
          Category Schema & Verification Specs — {selectedCat?.name}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {selectedCat && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`Code: ${selectedCat.code}`} sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
                <Chip
                  label={selectedCat.is_gatc_eligible ? 'GATC & LMO Eligible' : 'LMO Field Stamping Only'}
                  color={selectedCat.is_gatc_eligible ? 'primary' : 'default'}
                  sx={{ fontWeight: 700 }}
                />
                <Chip label={`Jurisdiction: ${selectedCat.jurisdiction_type}`} sx={{ fontWeight: 700 }} />
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
                Statutory Authority & Provisions:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                <Typography variant="body2"><strong>Act / Rules:</strong> {selectedCat.source_document || 'Legal Metrology Act, 2009'}</Typography>
                <Typography variant="body2"><strong>Specific Rule:</strong> {selectedCat.source_rule || 'Section 24'}</Typography>
                <Typography variant="body2"><strong>Gazette Notification:</strong> {selectedCat.source_notification || 'Standard Statutory Schedule'}</Typography>
                <Typography variant="body2"><strong>Description:</strong> {selectedCat.description}</Typography>
              </Paper>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
                Category-Specific Dynamic Fields Schema:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                  {JSON.stringify(JSON.parse(selectedCat.field_schema || '[]'), null, 2)}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedCat(null)} variant="contained" sx={{ bgcolor: '#1E293B' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
