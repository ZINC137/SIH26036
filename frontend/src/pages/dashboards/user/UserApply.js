import React, { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Grid, TextField, MenuItem, Button,
  Stepper, Step, StepLabel, Divider, Alert, Chip, Select,
  FormControl, InputLabel, CircularProgress,
} from "@mui/material";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";
import BuildIcon          from "@mui/icons-material/Build";
import BusinessIcon       from "@mui/icons-material/Business";
import { useNavigate } from "react-router-dom";

const COLOR    = "#E65100";
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

const steps = ["Instrument Details", "Business Info", "Review & Submit"];

// Consistent styling applied to every field (TextField & FormControl alike)
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    minHeight: 56,             // <-- fixes Select rendering smaller than TextField
    "&:hover fieldset":       { borderColor: COLOR },
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
  const [activeStep,    setActiveStep]    = useState(0);
  const [submitting,    setSubmitting]    = useState(false);
  const [submitted,     setSubmitted]     = useState(false);
  const [appNumber,     setAppNumber]     = useState("");
  const [error,         setError]         = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [form, setForm] = useState({
    instrumentType: "", make: "", model: "", serialNo: "", capacity: "", unit: "kg",
    businessName: "", gstNo: "", address: "", city: "", state: "", pincode: "",
    contactName: "", contactPhone: "", contactEmail: "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const p = data.user?.profile || {};
        const email = data.user?.email || "";
        setForm((f) => ({
          ...f,
          address:      p.address   || f.address,
          city:         p.city      || f.city,
          state:        p.state     || f.state,
          pincode:      p.pincode   || f.pincode,
          contactName:  p.full_name || f.contactName,
          contactPhone: p.phone     || f.contactPhone,
          contactEmail: email       || f.contactEmail,
        }));
        if (p.full_name || p.phone || p.address) setProfileLoaded(true);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          instrument_type: form.instrumentType,
          make:            form.make,
          model:           form.model,
          serial_no:       form.serialNo,
          capacity:        form.capacity,
          unit:            form.unit,
          business_name:   form.businessName,
          gst_no:          form.gstNo,
          address:         form.address,
          city:            form.city,
          state:           form.state,
          pincode:         form.pincode,
          contact_name:    form.contactName,
          contact_phone:   form.contactPhone,
          contact_email:   form.contactEmail,
        }),
      });
      const data = await res.json();
      if (res.ok) {
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

        {/* ────────── STEP 0 : Instrument Details ────────── */}
        {activeStep === 0 && (
          <Box>
            <StepHeader icon={<BuildIcon />} title="Instrument Details" subtitle="Enter the details of the instrument to be verified" />
            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={3}>

              {/* Instrument Type — full width so long names don't get clipped */}
              <Grid item xs={12}>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Instrument Type *</InputLabel>
                  <Select value={form.instrumentType} label="Instrument Type *" onChange={set("instrumentType")}>
                    {INSTRUMENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

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

              {/* Capacity + Unit side by side, proportional */}
              <Grid item xs={8} sm={4}>
                <TextField fullWidth label="Capacity *" value={form.capacity} onChange={set("capacity")} type="number" sx={fieldSx} />
              </Grid>
              <Grid item xs={4} sm={2}>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Unit</InputLabel>
                  <Select value={form.unit} label="Unit" onChange={set("unit")}>
                    {UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

            </Grid>
          </Box>
        )}

        {/* ────────── STEP 1 : Business Info ────────── */}
        {activeStep === 1 && (
          <Box>
            <StepHeader icon={<BusinessIcon />} title="Business Information" subtitle="Details of the business / premises where the instrument is used" />
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
                <TextField fullWidth label="Address *" value={form.address} onChange={set("address")} multiline rows={2} sx={fieldSx} />
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
            <StepHeader icon={<CheckCircleIcon />} title="Review & Submit" subtitle="Verify all details before final submission" />
            <Divider sx={{ mb: 4 }} />

            <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.2, display: "block", mb: 2 }}>
              Instrument Details
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {[
                ["Instrument Type", form.instrumentType],
                ["Make / Brand",    form.make],
                ["Model Number",    form.model || "—"],
                ["Serial Number",   form.serialNo],
                ["Capacity",        `${form.capacity} ${form.unit}`],
              ].map(([k, v]) => (
                <Grid item xs={12} sm={6} key={k}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#FAFAFA", border: "1px solid #EEEEEE" }}>
                    <Typography variant="caption" sx={{ color: "#9E9E9E", display: "block", mb: 0.4, fontWeight: 600 }}>{k}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#1A1A2E" }}>{v}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.2, display: "block", mb: 2 }}>
              Business & Contact
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                ["Business Name",  form.businessName],
                ["GST Number",     form.gstNo || "—"],
                ["Address",        `${form.address}, ${form.city}, ${form.state} – ${form.pincode}`],
                ["Contact Name",   form.contactName],
                ["Phone",          form.contactPhone],
                ["Email",          form.contactEmail],
              ].map(([k, v]) => (
                <Grid item xs={12} sm={6} key={k}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#FAFAFA", border: "1px solid #EEEEEE" }}>
                    <Typography variant="caption" sx={{ color: "#9E9E9E", display: "block", mb: 0.4, fontWeight: 600 }}>{k}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#1A1A2E" }}>{v}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Once submitted, the application cannot be edited. Please verify all details above.
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
              onClick={() => setActiveStep((s) => s + 1)}>
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
