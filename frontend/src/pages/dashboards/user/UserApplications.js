import React, { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Button, TextField, InputAdornment, MenuItem, Select, FormControl,
  InputLabel, CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, Grid, Stepper, Step, StepLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useNavigate } from "react-router-dom";

const COLOR = "#E65100";
const GRADIENT = "linear-gradient(135deg, #FF6D00, #E65100)";

const statusColor = {
  Approved:           { color: "#2E7D32", bg: "#E8F5E9" },
  Pending:            { color: "#E65100", bg: "#FFF3E0" },
  "Under Inspection": { color: "#1565C0", bg: "#E3F2FD" },
  Rejected:           { color: "#B71C1C", bg: "#FFEBEE" },
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function UserApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApps = () => {
    fetch("http://localhost:5000/api/auth/applications", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.applications) setApplications(d.applications);
        else setError("Could not load applications.");
      })
      .catch(() => setError("Could not connect to server."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const filtered = applications.filter((a) =>
    (filter === "All" || a.status === filter) &&
    (a.instrument_type.toLowerCase().includes(search.toLowerCase()) ||
      a.app_number.toLowerCase().includes(search.toLowerCase()) ||
      a.business_name.toLowerCase().includes(search.toLowerCase()))
  );

  const getTimelineStep = (status) => {
    if (status === "Pending") return 1;
    if (status === "Under Inspection") return 2;
    if (status === "Approved") return 3;
    if (status === "Rejected") return 3;
    return 0;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>USER PORTAL</Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#1A1A2E" }}>My Applications</Typography>
          <Typography variant="body2" sx={{ color: "#757575", mt: 0.5 }}>
            Real-time statutory tracking of verification requests submitted under the Legal Metrology Act.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => navigate("/dashboard/user/apply")}
          sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700, px: 3 }}
        >
          New Application
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search by Application No, business, or instrument..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#9E9E9E" }} /></InputAdornment> }}
          sx={{ minWidth: 320, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filter} label="Status" onChange={(e) => setFilter(e.target.value)} sx={{ borderRadius: 2 }}>
            {["All", "Pending", "Under Inspection", "Approved", "Rejected"].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {!loading && (
          <Chip
            label={`${filtered.length} application${filtered.length !== 1 ? "s" : ""}`}
            sx={{ bgcolor: "#F5F5F5", fontWeight: 700, alignSelf: "center" }}
          />
        )}
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #E0E0E0", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress sx={{ color: COLOR }} /></Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                  {["Application ID", "Instrument Specification", "Submitted", "Business Entity", "Priority", "Status", "Action"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "#424242", fontSize: "0.8rem" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell sx={{ fontWeight: 800, color: COLOR, fontSize: "0.82rem", fontFamily: "monospace" }}>
                      {app.app_number}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#1A1A2E" }}>
                        {app.instrument_type}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#757575" }}>
                        {app.make} · S/N: {app.serial_no} ({app.capacity}{app.unit})
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", color: "#616161" }}>{formatDate(app.submitted_at)}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", color: "#334155", fontWeight: 600 }}>{app.business_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.priority || "Normal"}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          bgcolor: app.priority === "High" ? "#FFEBEE" : "#F5F5F5",
                          color: app.priority === "High" ? "#B71C1C" : "#616161",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={app.status}
                        size="small"
                        sx={{
                          bgcolor: statusColor[app.status]?.bg || "#F5F5F5",
                          color: statusColor[app.status]?.color || "#424242",
                          fontWeight: 700,
                          fontSize: "0.72rem",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setSelectedApp(app)}
                        sx={{ color: "#1565C0", fontSize: "0.78rem", fontWeight: 700 }}
                      >
                        Track
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 6, color: "#9E9E9E" }}>
                      {applications.length === 0
                        ? 'No applications yet. Click "New Application" to get started.'
                        : "No results match your search."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      {/* ── TRACKING & DOSSIER MODAL ── */}
      <Dialog
        open={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ color: COLOR, fontWeight: 800, letterSpacing: 1 }}>
              STATUTORY APPLICATION TRACKER
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1A1A2E" }}>
              {selectedApp?.app_number} — {selectedApp?.business_name}
            </Typography>
          </Box>
          <Chip
            label={selectedApp?.status}
            sx={{
              bgcolor: statusColor[selectedApp?.status]?.bg,
              color: statusColor[selectedApp?.status]?.color,
              fontWeight: 800,
            }}
          />
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {selectedApp && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Stepper Timeline */}
              <Box sx={{ p: 2.5, bgcolor: "#F8FAFC", borderRadius: 2, border: "1px solid #E2E8F0" }}>
                <Stepper activeStep={getTimelineStep(selectedApp.status)} alternativeLabel>
                  <Step completed={true}>
                    <StepLabel>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>Submitted</Typography>
                      <Typography variant="caption" sx={{ color: "#64748B" }}>{formatDate(selectedApp.submitted_at)}</Typography>
                    </StepLabel>
                  </Step>
                  <Step completed={selectedApp.status !== "Pending"}>
                    <StepLabel>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>LMO Scrutiny</Typography>
                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                        {selectedApp.status === "Pending" ? "Awaiting Review" : "Clearance Granted"}
                      </Typography>
                    </StepLabel>
                  </Step>
                  <Step completed={selectedApp.status === "Approved" || selectedApp.status === "Rejected"}>
                    <StepLabel>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>Field Inspection</Typography>
                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                        {selectedApp.assigned_fo_name ? selectedApp.assigned_fo_name : "Officer Allocation"}
                      </Typography>
                    </StepLabel>
                  </Step>
                  <Step completed={selectedApp.status === "Approved"}>
                    <StepLabel>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>
                        {selectedApp.status === "Rejected" ? "Rejected" : "Certificate Form D"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                        {selectedApp.certificate_no ? selectedApp.certificate_no : "Under Processing"}
                      </Typography>
                    </StepLabel>
                  </Step>
                </Stepper>
              </Box>

              {/* Status Banner */}
              {selectedApp.status === "Approved" && (
                <Alert severity="success" icon={<CheckCircleIcon />} sx={{ borderRadius: 2 }}>
                  <strong>Verification Stamping Approved!</strong> Certificate Number: <strong>{selectedApp.certificate_no}</strong>. Stamped by <strong>{selectedApp.stamped_by}</strong>. Security Lead Seal: <strong>{selectedApp.security_seal_no}</strong>.
                </Alert>
              )}

              {selectedApp.status === "Under Inspection" && (
                <Alert severity="info" icon={<HourglassTopIcon />} sx={{ borderRadius: 2 }}>
                  <strong>Field Officer Assigned:</strong> {selectedApp.assigned_fo_name} ({selectedApp.assigned_fo_code || "Inspector"}) has been dispatched for on-ground verification. Scheduled date: <strong>{selectedApp.scheduled_date || "Today"}</strong> at <strong>{selectedApp.scheduled_time || "11:00 AM"}</strong>.
                </Alert>
              )}

              {selectedApp.status === "Pending" && (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  <strong>Under LMO Review:</strong> Application received by District Legal Metrology Officer. Verification fee of ₹{selectedApp.fee_amount} settled (Ref: {selectedApp.payment_ref}). An inspector will be assigned shortly.
                </Alert>
              )}

              {/* Specification Grid */}
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1E293B", mb: 2 }}>
                  Instrument &amp; Commercial Entity Specifications
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>INSTRUMENT TYPE</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedApp.instrument_type}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>MAKE &amp; MODEL</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedApp.make} {selectedApp.model}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>SERIAL NUMBER</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: "monospace" }}>{selectedApp.serial_no}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>CAPACITY</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedApp.capacity} {selectedApp.unit}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>ACCURACY CLASS</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedApp.accuracy_class || "Class III"}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>PREMISES ADDRESS</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedApp.address}, {selectedApp.city}, {selectedApp.state} - {selectedApp.pincode}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setSelectedApp(null)} sx={{ color: "#64748B", fontWeight: 600 }}>
            Close
          </Button>
          {selectedApp?.status === "Approved" && (
            <Button
              variant="contained"
              startIcon={<VerifiedIcon />}
              onClick={() => {
                setSelectedApp(null);
                navigate("/dashboard/user/certificates");
              }}
              sx={{ background: GRADIENT, fontWeight: 700 }}
            >
              View Certificate Form D
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
