import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const mockApplications = [
  {
    id: 'APP001',
    instrumentType: 'Electronic Scale',
    serialNumber: 'ES-2024-001',
    status: 'Pending',
    submittedDate: '2026-09-01',
    expectedDate: '2026-09-15',
    progress: 30,
  },
  {
    id: 'APP002',
    instrumentType: 'Weighing Balance',
    serialNumber: 'WB-2024-002',
    status: 'Under Review',
    submittedDate: '2026-08-28',
    expectedDate: '2026-09-10',
    progress: 60,
  },
  {
    id: 'APP003',
    instrumentType: 'Pressure Gauge',
    serialNumber: 'PG-2024-003',
    status: 'Approved',
    submittedDate: '2026-08-15',
    expectedDate: '2026-08-25',
    progress: 100,
  },
  {
    id: 'APP004',
    instrumentType: 'Temperature Gauge',
    serialNumber: 'TG-2024-004',
    status: 'Pending',
    submittedDate: '2026-09-03',
    expectedDate: '2026-09-17',
    progress: 20,
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'success';
    case 'Under Review':
      return 'warning';
    case 'Pending':
      return 'default';
    case 'Rejected':
      return 'error';
    default:
      return 'default';
  }
};

export default function MyApplications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const filteredApplications = mockApplications.filter((app) =>
    app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.instrumentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (app) => {
    setSelectedApp(app);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedApp(null);
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
          My Applications
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Track and manage your instrument verification applications.
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by ID, instrument type, or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: '#757575' }} />,
            }}
          />
        </Box>
      </Card>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D47A1' }}>
              {mockApplications.length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Total Applications
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9800' }}>
              {mockApplications.filter((a) => a.status === 'Pending').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Pending
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1565C0' }}>
              {mockApplications.filter((a) => a.status === 'Under Review').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Under Review
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#4CAF50' }}>
              {mockApplications.filter((a) => a.status === 'Approved').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Approved
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Applications Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#F5F5F5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>App ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Instrument Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Serial Number</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApplications.map((app) => (
              <TableRow key={app.id} sx={{ '&:hover': { bgcolor: '#F5F5F5' } }}>
                <TableCell sx={{ fontWeight: 600 }}>{app.id}</TableCell>
                <TableCell>{app.instrumentType}</TableCell>
                <TableCell>{app.serialNumber}</TableCell>
                <TableCell>
                  <Chip
                    label={app.status}
                    color={getStatusColor(app.status)}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{app.submittedDate}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ bgcolor: '#0D47A1' }}
                    onClick={() => handleViewDetails(app)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredApplications.length === 0 && (
        <Card sx={{ mt: 4, p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            No applications found. Try adjusting your search criteria.
          </Typography>
        </Card>
      )}

      {/* Details Dialog */}
      {selectedApp && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#0D47A1', color: 'white', fontWeight: 700 }}>
            Application Details: {selectedApp.id}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Instrument Type
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {selectedApp.instrumentType}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Serial Number
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {selectedApp.serialNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Submitted Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {selectedApp.submittedDate}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Expected Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {selectedApp.expectedDate}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Current Status
                </Typography>
                <Chip
                  label={selectedApp.status}
                  color={getStatusColor(selectedApp.status)}
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#757575', display: 'block', mb: 1 }}>
                  Processing Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={selectedApp.progress}
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 40 }}>
                    {selectedApp.progress}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} variant="contained" sx={{ bgcolor: '#0D47A1' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}
