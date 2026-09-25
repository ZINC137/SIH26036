import React, { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Button, TextField, InputAdornment, MenuItem, Select, FormControl,
  InputLabel, CircularProgress, Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
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

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/applications", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.applications) setApplications(d.applications);
        else setError("Could not load applications.");
      })
      .catch(() => setError("Could not connect to server."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = applications.filter((a) =>
    (filter === "All" || a.status === filter) &&
    (a.instrument_type.toLowerCase().includes(search.toLowerCase()) ||
      a.app_number.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: COLOR, fontWeight: 700, letterSpacing: 1.5 }}>USER PORTAL</Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#1A1A2E" }}>My Applications</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => navigate("/dashboard/user/apply")}
          sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 700, px: 3 }}>
          New Application
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField placeholder="Search by ID or instrument..." size="small" value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#9E9E9E" }} /></InputAdornment> }}
          sx={{ minWidth: 280, "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filter} label="Status" onChange={(e) => setFilter(e.target.value)} sx={{ borderRadius: 2 }}>
            {["All", "Approved", "Pending", "Under Inspection", "Rejected"].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {!loading && <Chip label={`${filtered.length} result${filtered.length !== 1 ? "s" : ""}`} sx={{ bgcolor: "#F5F5F5", fontWeight: 600, alignSelf: "center" }} />}
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #E0E0E0", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                  {["Application ID", "Instrument", "Submitted", "Business", "Status", "Action"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "#424242", fontSize: "0.8rem" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: COLOR, fontSize: "0.8rem" }}>{app.app_number}</TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>{app.instrument_type}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", color: "#757575" }}>{formatDate(app.submitted_at)}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", color: "#616161" }}>{app.business_name}</TableCell>
                    <TableCell>
                      <Chip label={app.status} size="small"
                        sx={{ bgcolor: statusColor[app.status]?.bg, color: statusColor[app.status]?.color, fontWeight: 700, fontSize: "0.72rem" }} />
                    </TableCell>
                    <TableCell>
                      <Button size="small" sx={{ color: "#1565C0", fontSize: "0.75rem", fontWeight: 600 }}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: "center", py: 6, color: "#9E9E9E" }}>
                      {applications.length === 0
                        ? "No applications yet. Click \"New Application\" to get started."
                        : "No results match your search."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
