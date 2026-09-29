import React, { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Grid, TextField, MenuItem, Button,
  Stepper, Step, StepLabel, Divider, Alert, Chip, Select,
  FormControl, InputLabel, CircularProgress, Card, Radio,
  RadioGroup, FormControlLabel,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BuildIcon from "@mui/icons-material/Build";
import BusinessIcon from "@mui/icons-material/Business";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GavelIcon from "@mui/icons-material/Gavel";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../../config/api";

const COLOR = "#E65100";
const GRADIENT = "linear-gradient(135deg, #FF6D00, #E65100)";

const INSTRUMENT_TYPES = [
  "Weighing Scale (Capacity <= 5kg)",
  "Weighing Scale (5kg - 50kg)",
  "Platform Balance (50kg - 500kg)",
  "Fuel Dispenser",
  "Moisture Meter",
  "Pressure Gauge",
  "Water Flow Meter",
  "Counter Scale",
  "Crane Scale",
  "Other",
];

const UNITS = ["kg", "g", "L", "mL", "bar", "m³/h"];

const steps = ["Instrument & Verification Type", "Business & Premises Info", "Review & Submit"];

// Consistent styling applied to every field (TextField & FormControl alike)
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    minHeight: 56,
    "&:hover fieldset": { borderColor: COLOR },
    "&.Mui-focused fieldset": { borderColor: COLOR },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: COLOR },
};

// Section header component used in each step
function StepHeader({ icon, title, subtitle }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: 2,
        bgcolor: "#FFF3E0",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {React.cloneElement(icon, { sx: { color: COLOR, fontSize: 22 } })}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1A1A2E", lineHeight: 1.2 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: "#9E9E9E", mt: 0.2 }}>{subtitle}</Typography>
      </Box>
    </Box>
  );
}

export default function UserApply() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appNumber, setAppNumber] = useState("");
  const [error, setError] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  // SIH Workflow & Lifecycle states
  const [applicationType, setApplicationType] = useState("INITIAL_VERIFICATION");
  const [registeredInstruments, setRegisteredInstruments] = useState([]);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState("");
  const [previousCertificateNo, setPreviousCertificateNo] = useState("");
  const [inspectionMode, setInspectionMode] = useState("ON_SITE");
  const [preferredDate, setPreferredDate] = useState("");
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Legal Metrology Rule Configuration Engine states
  const [categories, setCategories] = useState([]);
  const [selectedCategoryCode, setSelectedCategoryCode] = useState("");
  const [activeRule, setActiveRule] = useState(null);
  const [preferredRoute, setPreferredRoute] = useState("NO_PREFERENCE");
  const [dynamicFields, setDynamicFields] = useState({});
  const [loadingRule, setLoadingRule] = useState(false);

  const [form, setForm] = useState({
    instrumentType: "", make: "", model: "", serialNo: "", capacity: "", unit: "kg",
    businessName: "", gstNo: "", address: "", city: "", state: "", pincode: "",
    contactName: "", contactPhone: "", contactEmail: "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const setDynamicField = (name, val) => {
    setDynamicFields((prev) => ({ ...prev, [name]: val }));
  };

  useEffect(() => {
    authFetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        const p = data.user?.profile || {};
        const email = data.user?.email || "";
        setForm((f) => ({
          ...f,
          address: p.address || f.address,
          city: p.city || f.city,
          state: p.state || f.state,
          pincode: p.pincode || f.pincode,
          contactName: p.full_name || f.contactName,
          contactPhone: p.phone || f.contactPhone,
          contactEmail: email || f.contactEmail,
        }));
        if (p.full_name || p.phone || p.address) setProfileLoaded(true);
      })
      .catch(() => {});

    // 2. Fetch existing instruments for re-verification linking
    authFetch("/api/auth/instruments")
      .then((r) => r.json())
      .then((data) => {
        if (data.instruments) {
          setRegisteredInstruments(data.instruments);
        }
      })
      .catch(() => {});

    // 3. Fetch Legal Metrology Instrument Categories
    authFetch("/api/rules/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  const handleCategoryChange = async (catCode) => {
    setSelectedCategoryCode(catCode);
    const cat = categories.find((c) => c.code === catCode);
    setForm((f) => ({
      ...f,
      instrumentType: cat ? cat.name : catCode,
      unit: cat && cat.units && cat.units.length > 0 ? cat.units[0] : f.unit,
    }));
    setLoadingRule(true);
    try {
      const res = await authFetch(`/api/rules/applicable?categoryCode=${catCode}&stateCode=${form.state || 'Delhi'}`);
      const data = await res.json();
      if (data.category) {
        setActiveRule(data);
        if (!data.category.is_gatc_eligible && preferredRoute === 'GATC') {
          setPreferredRoute('NO_PREFERENCE');
        }
      }
    } catch (e) {
      console.error('Failed to load applicable rule:', e);
    } finally {
      setLoadingRule(false);
    }
  };

  // When an existing instrument is selected for re-verification
  const handleSelectInstrument = (instId) => {
    setSelectedInstrumentId(instId);
    if (!instId) return;
    const inst = registeredInstruments.find((i) => i.id === instId);
    if (inst) {
      setForm((f) => ({
        ...f,
        instrumentType: inst.instrument_type || f.instrumentType,
        make: inst.make || f.make,
        model: inst.model || f.model || "",
        serialNo: inst.serial_no || f.serialNo,
        capacity: inst.capacity || f.capacity,
        unit: inst.unit || f.unit,
      }));
      setPreviousCertificateNo(inst.current_certificate_no || "");
    }
  };

  // Upload photo / document handler
  const handleFileUpload = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", docType);

      const res = await authFetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.document) {
        setUploadedDocuments((prev) => [...prev, data.document]);
      } else {
        setError(data.error || "File upload failed.");
      }
    } catch {
      setError("Failed to upload document to server.");
    } finally {
      setUploadingDoc(false);
      // Reset input value
      e.target.value = "";
    }
  };

  const removeDocument = (docId) => {
    setUploadedDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const validateStep0 = () => {
    const instType = form.instrumentType || selectedCategoryCode;
    if (!instType) {
      setError("Please select a Legal Metrology Instrument Category.");
      return false;
    }
    if (!form.make || !form.make.trim()) {
      setError("Please enter the Make / Brand of the instrument.");
      return false;
    }
    if (!form.serialNo || !form.serialNo.trim()) {
      setError("Please enter the Serial Number.");
      return false;
    }
    if (!form.capacity || !form.capacity.toString().trim()) {
      setError("Please enter the Capacity of the instrument.");
      return false;
    }
    return true;
  };

  const validateStep1 = () => {
    if (!form.businessName || !form.businessName.trim()) {
      setError("Please enter the Business / Shop Name.");
      return false;
    }
    if (!form.address || !form.address.trim()) {
      setError("Please enter the Premises Address.");
      return false;
    }
    if (!form.city || !form.city.trim()) {
      setError("Please enter the City.");
      return false;
    }
    if (!form.state || !form.state.trim()) {
      setError("Please enter the State.");
      return false;
    }
    if (!form.pincode || !form.pincode.trim()) {
      setError("Please enter the Pincode.");
      return false;
    }
    if (!form.contactName || !form.contactName.trim()) {
      setError("Please enter the Contact Person Name.");
      return false;
    }
    if (!form.contactPhone || !form.contactPhone.trim()) {
      setError("Please enter the Contact Phone Number.");
      return false;
    }
    if (!form.contactEmail || !form.contactEmail.trim()) {
      setError("Please enter the Contact Email Address.");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError("");
    if (activeStep === 0 && !validateStep0()) return;
    if (activeStep === 1 && !validateStep1()) return;
    setActiveStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setError("");
    if (!validateStep0() || !validateStep1()) return;

    setSubmitting(true);
    try {
      const resolvedInstType = form.instrumentType || (categories.find((c) => c.code === selectedCategoryCode)?.name) || selectedCategoryCode || "Weighing Scale";

      const res = await authFetch("/api/auth/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_type: applicationType,
          instrument_id: selectedInstrumentId || undefined,
          previous_certificate_no: previousCertificateNo || undefined,
          inspection_mode: inspectionMode,
          preferred_date: preferredDate || undefined,
          instrument_type: resolvedInstType,
          selected_category_code: selectedCategoryCode || undefined,
          preferred_verification_route: preferredRoute,
          category_fields_data: Object.keys(dynamicFields).length > 0 ? JSON.stringify(dynamicFields) : undefined,
          make: form.make,
          model: form.model || undefined,
          serial_no: form.serialNo,
          capacity: form.capacity,
          unit: form.unit || "kg",
          business_name: form.businessName,
          gst_no: form.gstNo || undefined,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          contact_name: form.contactName,
          contact_phone: form.contactPhone,
          contact_email: form.contactEmail,
          document_ids: uploadedDocuments.map((d) => d.id),
        }),
      });
      const data = await res.json();
      if (res.ok && data.application) {
        setAppNumber(data.application.app_number);
        setSubmitted(true);
      } else {
        setError(data.error || "Submission failed. Please try again.");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────
  if (submitted) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "75vh" }}>
        <Paper elevation={0} sx={{
          p: { xs: 4, md: 6 }, borderRadius: 4, textAlign: "center",
          maxWidth: 500, width: "100%",
          border: "2px solid #4CAF50",
          boxShadow: "0 8px 32px rgba(46,125,50,0.12)",
        }}>
          <Box sx={{ width: 84, height: 84, borderRadius: "50%", bgcolor: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 52, color: "#2E7D32" }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#1A1A2E", mb: 1 }}>Application Submitted!</Typography>
          <Typography variant="body1" sx={{ color: "#616161", mb: 3 }}>Your application has been received and is under review.</Typography>
          <Chip label={appNumber} sx={{ bgcolor: "#E8F5E9", color: "#2E7D32", fontWeight: 700, fontSize: "1rem", px: 2, py: 2.5, mb: 3, borderRadius: 2 }} />
          <Box sx={{ p: 2.5, bgcolor: "#FFF8E1", borderRadius: 2, border: "1px solid #FFD54F", mb: 3 }}>
            <Typography variant="body2" sx={{ color: "#795548" }}>
              Status: <strong>Pending</strong> · An LMO officer will review within 3–5 business days.
            </Typography>
          </Box>
          <Button variant="contained" fullWidth sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700, py: 1.4 }}
            onClick={() => navigate("/dashboard/user/applications")}>
            Track My Application
          </Button>
        </Paper>
      </Box>
    );
  }

  // ── Main form ────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 880, mx: "auto" }}>

      {/* Page header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>USER PORTAL</Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, color: "#1A1A2E", lineHeight: 1.2 }}>New Verification Application</Typography>
        <Typography variant="body2" sx={{ color: "#757575", mt: 0.5 }}>
          Apply for instrument verification under the Legal Metrology Act, 2009
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #E0E0E0", mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, i) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{ sx: { "&.Mui-active": { color: COLOR }, "&.Mui-completed": { color: COLOR } } }}
              >
                <Typography variant="caption" sx={{ fontWeight: activeStep === i ? 700 : 500, color: activeStep === i ? COLOR : "#757575" }}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>
      )}

      {/* Form card */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #E0E0E0" }}>

        {/* ────────── STEP 0 : Instrument & Verification Type ────────── */}
        {activeStep === 0 && (
          <Box>
            <StepHeader icon={<BuildIcon />} title="Verification Category & Instrument Details" subtitle="Select statutory verification workflow and specify instrument parameters" />
            <Divider sx={{ mb: 3 }} />

            {/* Application Type Selector */}
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, display: "block", mb: 1.5 }}>
              1. Statutory Verification Workflow (Legal Metrology Act, Sec 24)
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Card
                  variant="outlined"
                  onClick={() => { setApplicationType("INITIAL_VERIFICATION"); setSelectedInstrumentId(""); }}
                  sx={{
                    p: 2, cursor: "pointer", borderRadius: 3,
                    borderColor: applicationType === "INITIAL_VERIFICATION" ? COLOR : "#E2E8F0",
                    bgcolor: applicationType === "INITIAL_VERIFICATION" ? "#FFF7ED" : "#FFFFFF",
                    borderWidth: applicationType === "INITIAL_VERIFICATION" ? 2 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <VerifiedUserIcon sx={{ color: applicationType === "INITIAL_VERIFICATION" ? COLOR : "#94A3B8" }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A" }}>
                        Initial Verification
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>
                        For newly manufactured, imported or commissioned weights & measures.
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card
                  variant="outlined"
                  onClick={() => setApplicationType("RE_VERIFICATION")}
                  sx={{
                    p: 2, cursor: "pointer", borderRadius: 3,
                    borderColor: applicationType === "RE_VERIFICATION" ? COLOR : "#E2E8F0",
                    bgcolor: applicationType === "RE_VERIFICATION" ? "#FFF7ED" : "#FFFFFF",
                    borderWidth: applicationType === "RE_VERIFICATION" ? 2 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <AutorenewIcon sx={{ color: applicationType === "RE_VERIFICATION" ? COLOR : "#94A3B8" }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A" }}>
                        Periodical Re-verification
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>
                        Mandatory annual/biennial renewal or post-repair re-stamping.
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* Re-verification helper: Select registered instrument */}
            {applicationType === "RE_VERIFICATION" && (
              <Box sx={{ mb: 3, p: 2.5, bgcolor: "#F8FAFC", borderRadius: 3, border: "1px dashed #CBD5E1" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1E293B", mb: 1.5 }}>
                  Select from Your Registered Instruments
                </Typography>
                {registeredInstruments.length > 0 ? (
                  <FormControl fullWidth sx={{ ...fieldSx, mb: 2 }}>
                    <InputLabel>Choose Existing Instrument</InputLabel>
                    <Select
                      value={selectedInstrumentId}
                      label="Choose Existing Instrument"
                      onChange={(e) => handleSelectInstrument(e.target.value)}
                    >
                      <MenuItem value="">-- Enter Instrument Details Manually --</MenuItem>
                      {registeredInstruments.map((inst) => (
                        <MenuItem key={inst.id} value={inst.id}>
                          {inst.instrument_type} — {inst.make} (S/N: {inst.serial_no}) · Status: {inst.current_status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Typography variant="caption" sx={{ color: "#64748B", display: "block", mb: 2 }}>
                    No previously verified instruments found in your account. You can enter your previous certificate details below.
                  </Typography>
                )}
                <TextField
                  fullWidth
                  label="Previous Verification Certificate Number"
                  value={previousCertificateNo}
                  onChange={(e) => setPreviousCertificateNo(e.target.value)}
                  placeholder="e.g. DL-LM-2025-XXXX"
                  sx={fieldSx}
                />
              </Box>
            )}

            <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, display: "block", mb: 1.5 }}>
              2. Technical Specifications
            </Typography>

            <Grid container spacing={3}>
              {/* Instrument Category Selector */}
              <Grid item xs={12}>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Legal Metrology Instrument Category *</InputLabel>
                  <Select
                    value={selectedCategoryCode || form.instrumentType}
                    label="Legal Metrology Instrument Category *"
                    onChange={(e) => {
                      const val = e.target.value;
                      const matchedCat = categories.find((c) => c.code === val || c.name === val);
                      if (matchedCat) {
                        handleCategoryChange(matchedCat.code);
                      } else {
                        setForm((f) => ({ ...f, instrumentType: val }));
                      }
                    }}
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <MenuItem key={c.id || c.code} value={c.code}>
                          {c.name} {c.jurisdiction_type === 'STATE' ? `[State Prescribed - ${c.state_code}]` : ''} {c.is_gatc_eligible ? '(GATC & LMO Eligible)' : '(LMO Field Stamping Only)'}
                        </MenuItem>
                      ))
                    ) : (
                      INSTRUMENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Statutory Verification Route Eligibility Panel (Section 5 & 18) */}
              {loadingRule && (
                <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                  <CircularProgress size={20} sx={{ color: COLOR }} />
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    Evaluating statutory legal rules and jurisdiction authority matrix...
                  </Typography>
                </Grid>
              )}

              {activeRule && !loadingRule && (
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2.5,
                      bgcolor: '#F8FAFC',
                      borderRadius: 3,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GavelIcon sx={{ color: COLOR, fontSize: 20 }} /> Verification Route Eligibility (Statutory Source of Truth)
                      </Typography>
                      <Chip
                        size="small"
                        label={`Statutory Rule: ${activeRule.category?.sourceRule || 'Rule 3(1)'} · ${activeRule.category?.sourceDocument || 'LM Act 2009'}`}
                        sx={{ bgcolor: '#FFF3E0', color: COLOR, fontWeight: 700, fontSize: '0.75rem' }}
                      />
                    </Box>

                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5 }}>
                      Legal Metrology (GATC) Rules, 2013 (amended 2025/2026): Weight/Measure may be verified either by accredited GATC or by Legal Metrology Officers.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                      <Chip
                        icon={<CheckCircleIcon sx={{ color: '#16A34A !important' }} />}
                        label="✓ Legal Metrology Officer (LMO / Field Officer) — Legally Permitted"
                        sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700, py: 0.5 }}
                      />

                      {activeRule.category?.isGatcEligible ? (
                        <Chip
                          icon={<CheckCircleIcon sx={{ color: '#2563EB !important' }} />}
                          label="✓ Government Approved Test Centre (GATC Lab) — Legally Permitted"
                          sx={{ bgcolor: '#DBEAFE', color: '#1D4ED8', fontWeight: 700, py: 0.5 }}
                        />
                      ) : (
                        <Chip
                          label="✗ GATC: Not permitted under First Schedule (LMO Reserved Stamping)"
                          sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 700, py: 0.5 }}
                        />
                      )}
                    </Box>

                    <Alert severity="info" sx={{ borderRadius: 2, mb: 2, fontSize: '0.82rem', py: 0.5 }}>
                      <strong>Statutory Assignment Policy:</strong> Final verification authority will be assigned by the department based on applicable rules, jurisdiction, authorization and availability.
                    </Alert>

                    {/* Applicant Preferred Route Option */}
                    <Box sx={{ pt: 1, borderTop: '1px dashed #CBD5E1' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                        Preferred Verification Route (Optional Preference Only — Does Not Override Backend Eligibility):
                      </Typography>
                      <RadioGroup
                        row
                        value={preferredRoute}
                        onChange={(e) => setPreferredRoute(e.target.value)}
                      >
                        <FormControlLabel
                          value="NO_PREFERENCE"
                          control={<Radio size="small" sx={{ color: COLOR, '&.Mui-checked': { color: COLOR } }} />}
                          label={<Typography variant="body2" sx={{ fontWeight: 600 }}>No Preference (Department Chooses)</Typography>}
                        />
                        <FormControlLabel
                          value="LMO"
                          control={<Radio size="small" sx={{ color: COLOR, '&.Mui-checked': { color: COLOR } }} />}
                          label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Legal Metrology Officer (LMO)</Typography>}
                        />
                        <FormControlLabel
                          value="GATC"
                          disabled={!activeRule.category?.isGatcEligible}
                          control={<Radio size="small" sx={{ color: COLOR, '&.Mui-checked': { color: COLOR } }} />}
                          label={
                            <Typography variant="body2" sx={{ fontWeight: 600, color: !activeRule.category?.isGatcEligible ? '#94A3B8' : 'inherit' }}>
                              Government Approved Test Centre (GATC) {!activeRule.category?.isGatcEligible ? '(Ineligible)' : ''}
                            </Typography>
                          }
                        />
                      </RadioGroup>
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* Make / Brand */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Make / Brand *" value={form.make} onChange={set("make")} sx={fieldSx} />
              </Grid>

              {/* Model */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Model Number" value={form.model} onChange={set("model")} sx={fieldSx} helperText="Optional" />
              </Grid>

              {/* Serial No */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Serial Number *" value={form.serialNo} onChange={set("serialNo")} sx={fieldSx} />
              </Grid>

              {/* Capacity + Unit */}
              <Grid item xs={8} sm={4}>
                <TextField fullWidth label="Capacity *" value={form.capacity} onChange={set("capacity")} type="number" sx={fieldSx} />
              </Grid>
              <Grid item xs={4} sm={2}>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Unit</InputLabel>
                  <Select value={form.unit} label="Unit" onChange={set("unit")}>
                    {activeRule?.category?.units && activeRule.category.units.length > 0 ? (
                      activeRule.category.units.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)
                    ) : (
                      UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Dynamic Category Fields (Section 7, 8, 9) */}
              {activeRule?.fieldSchema && activeRule.fieldSchema.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2.5, bgcolor: '#FAFAFA', borderRadius: 3, border: '1px solid #EEEEEE' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 2 }}>
                      Category-Specific Technical Parameters ({activeRule.category?.name})
                    </Typography>
                    <Grid container spacing={2}>
                      {activeRule.fieldSchema.map((field) => (
                        <Grid item xs={12} sm={field.type === 'select' ? 6 : 6} key={field.name}>
                          {field.type === 'select' ? (
                            <FormControl fullWidth size="small" sx={fieldSx}>
                              <InputLabel>{field.label} {field.required ? '*' : ''}</InputLabel>
                              <Select
                                value={dynamicFields[field.name] || ''}
                                label={`${field.label} ${field.required ? '*' : ''}`}
                                onChange={(e) => setDynamicField(field.name, e.target.value)}
                              >
                                {field.options.map((opt) => (
                                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              label={`${field.label} ${field.required ? '*' : ''}`}
                              type={field.type === 'number' ? 'number' : 'text'}
                              value={dynamicFields[field.name] || ''}
                              onChange={(e) => setDynamicField(field.name, e.target.value)}
                              sx={fieldSx}
                            />
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* Document & Photo Upload */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, display: "block", mb: 1 }}>
              3. Supporting Documents & Photographs (Requirement 13)
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
              Upload clear photographs of the instrument nameplate and purchase invoice or previous verification receipt (JPEG/PNG/PDF, Max 10MB).
            </Typography>

            {/* Category-Specific Statutory Document Requirements (Section 25) */}
            {activeRule?.documents && activeRule.documents.length > 0 && (
              <Box sx={{ mb: 2.5, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                  Prescribed Category Documents for {activeRule.category?.name}:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {activeRule.documents.map((d) => (
                    <Chip
                      key={d.id || d.document_code}
                      size="small"
                      label={`${d.name} ${d.mandatory ? '(Mandatory)' : '(Optional)'}`}
                      sx={{
                        bgcolor: d.mandatory ? '#FEF2F2' : '#F1F5F9',
                        color: d.mandatory ? '#991B1B' : '#475569',
                        fontWeight: 600,
                        border: d.mandatory ? '1px solid #FECACA' : '1px solid #CBD5E1',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={uploadingDoc}
                sx={{ borderColor: "#CBD5E1", color: "#334155", fontWeight: 700, borderRadius: 2 }}
              >
                Upload Nameplate Photo
                <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, "INSTRUMENT_PHOTO")} />
              </Button>

              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                disabled={uploadingDoc}
                sx={{ borderColor: "#CBD5E1", color: "#334155", fontWeight: 700, borderRadius: 2 }}
              >
                Upload Invoice / Stamping Slip
                <input type="file" hidden accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, "SUPPORTING_DOCUMENT")} />
              </Button>

              {uploadingDoc && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: COLOR }} />
                  <Typography variant="caption" sx={{ color: "#64748B" }}>Uploading securely...</Typography>
                </Box>
              )}
            </Box>

            {uploadedDocuments.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", p: 1.5, bgcolor: "#F1F5F9", borderRadius: 2 }}>
                {uploadedDocuments.map((doc) => (
                  <Chip
                    key={doc.id}
                    label={`${doc.doc_type === "INSTRUMENT_PHOTO" ? "📷 Photo" : "📄 Doc"}: ${doc.file_name}`}
                    onDelete={() => removeDocument(doc.id)}
                    deleteIcon={<CloseIcon />}
                    sx={{ bgcolor: "#FFFFFF", fontWeight: 600, border: "1px solid #CBD5E1" }}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* ────────── STEP 1 : Business & Premises Info ────────── */}
        {activeStep === 1 && (
          <Box>
            <StepHeader icon={<BusinessIcon />} title="Business & Premises Information" subtitle="Details of premises and preferred verification logistics" />
            <Divider sx={{ mb: profileLoaded ? 2 : 4 }} />

            {profileLoaded && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                ✨ Contact and address fields have been pre-filled from your profile — edit as needed.
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <TextField fullWidth label="Business / Shop Name *" value={form.businessName} onChange={set("businessName")} sx={fieldSx} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="GST Number" value={form.gstNo} onChange={set("gstNo")} sx={fieldSx} helperText="Optional" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Address of Premises *" value={form.address} onChange={set("address")} multiline rows={2} sx={fieldSx} />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField fullWidth label="City *" value={form.city} onChange={set("city")} sx={fieldSx} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="State *" value={form.state} onChange={set("state")} sx={fieldSx} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="Pincode *" value={form.pincode} onChange={set("pincode")} sx={fieldSx} inputProps={{ maxLength: 6 }} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" sx={{ color: "#9E9E9E", fontWeight: 700, letterSpacing: 1 }}>VERIFICATION PREFERENCES</Typography>
            </Divider>

            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Inspection Mode</InputLabel>
                  <Select value={inspectionMode} label="Inspection Mode" onChange={(e) => setInspectionMode(e.target.value)}>
                    <MenuItem value="ON_SITE">On-Site Verification at Business Premises</MenuItem>
                    <MenuItem value="AT_CENTRE">At Legal Metrology Centre / GATC Lab</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Preferred Inspection Date"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                  helperText="Subject to officer & testing centre scheduling"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" sx={{ color: "#9E9E9E", fontWeight: 700, letterSpacing: 1 }}>CONTACT PERSON</Typography>
            </Divider>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Contact Name *" value={form.contactName} onChange={set("contactName")} sx={fieldSx} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Phone Number *" value={form.contactPhone} onChange={set("contactPhone")} sx={fieldSx} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Email Address *" value={form.contactEmail} onChange={set("contactEmail")} type="email" sx={fieldSx} />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ────────── STEP 2 : Review & Submit ────────── */}
        {activeStep === 2 && (
          <Box>
            <StepHeader icon={<CheckCircleIcon />} title="Review & Submit" subtitle="Verify all statutory details before final submission" />
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3, display: "flex", gap: 1, alignItems: "center" }}>
              <Chip
                label={applicationType === "RE_VERIFICATION" ? "PERIODICAL RE-VERIFICATION" : "INITIAL STATUTORY VERIFICATION"}
                sx={{
                  bgcolor: applicationType === "RE_VERIFICATION" ? "#F59E0B" : "#10B981",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                }}
              />
              <Chip
                label={inspectionMode === "ON_SITE" ? "Mode: On-Site Inspection" : "Mode: At GATC / Lab"}
                sx={{ bgcolor: "#F1F5F9", color: "#334155", fontWeight: 700, fontSize: "0.75rem" }}
              />
            </Box>

            <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.2, display: "block", mb: 1.5 }}>
              Instrument Specifications
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                ["Instrument Type", form.instrumentType],
                ["Make / Brand", form.make],
                ["Model Number", form.model || "—"],
                ["Serial Number", form.serialNo],
                ["Capacity", `${form.capacity} ${form.unit}`],
                ["Previous Certificate", previousCertificateNo || "None (First Time Online Registration)"],
              ].map(([k, v]) => (
                <Grid item xs={12} sm={6} key={k}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#FAFAFA", border: "1px solid #EEEEEE" }}>
                    <Typography variant="caption" sx={{ color: "#9E9E9E", display: "block", mb: 0.4, fontWeight: 600 }}>{k}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#1A1A2E" }}>{v}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.2, display: "block", mb: 1.5 }}>
              Premises & Logistics
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                ["Business Name", form.businessName],
                ["GST Number", form.gstNo || "—"],
                ["Address", `${form.address}, ${form.city}, ${form.state} – ${form.pincode}`],
                ["Preferred Date", preferredDate || "Earliest available official slot"],
                ["Contact Person", `${form.contactName} (📞 ${form.contactPhone})`],
                ["Email", form.contactEmail],
              ].map(([k, v]) => (
                <Grid item xs={12} sm={6} key={k}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#FAFAFA", border: "1px solid #EEEEEE" }}>
                    <Typography variant="caption" sx={{ color: "#9E9E9E", display: "block", mb: 0.4, fontWeight: 600 }}>{k}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#1A1A2E" }}>{v}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Uploaded Documents Summary */}
            <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.2, display: "block", mb: 1 }}>
              Uploaded Documents ({uploadedDocuments.length})
            </Typography>
            {uploadedDocuments.length > 0 ? (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
                {uploadedDocuments.map((doc) => (
                  <Chip
                    key={doc.id}
                    label={`${doc.file_name} (${(doc.file_size / 1024).toFixed(0)} KB)`}
                    sx={{ bgcolor: "#EFF6FF", color: "#1E40AF", fontWeight: 700 }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 3 }}>
                No documents uploaded. Photographs may be requested by the verifying officer during on-site visit.
              </Typography>
            )}

            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Once submitted, this application enters the official Legal Metrology statutory register and is locked against modifications.
            </Alert>
          </Box>
        )}

        {/* Navigation */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 5, pt: 3, borderTop: "1px solid #F0F0F0" }}>
          <Button
            onClick={() => activeStep === 0 ? navigate("/dashboard/user") : setActiveStep((s) => s - 1)}
            sx={{ color: "#757575", fontWeight: 600, borderRadius: 2, px: 3, py: 1 }}
          >
            {activeStep === 0 ? "Cancel" : "← Back"}
          </Button>

          {activeStep < steps.length - 1 ? (
            <Button variant="contained"
              sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700, px: 5, py: 1.2 }}
              onClick={handleNextStep}>
              Next Step →
            </Button>
          ) : (
            <Button variant="contained"
              sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700, px: 5, py: 1.2, minWidth: 200 }}
              onClick={handleSubmit} disabled={submitting}>
              {submitting ? <CircularProgress size={22} color="inherit" /> : "Submit Application"}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
