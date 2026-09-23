import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const mockApplications = [
  {
    id: 'APP-9021',
    company: 'Reliance Fresh',
    location: 'District A',
    instrument: 'Electronic Scale',
    priority: 'Normal',
    status: 'Pending',
    submittedDate: '2026-09-02',
    assignedOfficer: null,
  },
  {
    id: 'APP-9022',
    company: 'Indian Oil Petrol Pump',
    location: 'District B',
    instrument: 'Fuel Dispenser',
    priority: 'High',
    status: 'Under Review',
    submittedDate: '2026-09-01',
    assignedOfficer: 'Ramesh Kumar',
  },
  {
    id: 'APP-9023',
    company: 'Tata Steel Plant',
    location: 'District C',
    instrument: 'Weighbridge',
    priority: 'High',
    status: 'Pending',
    submittedDate: '2026-08-31',
    assignedOfficer: null,
  },
];

const fieldOfficers = [
  { id: 'FO-101', name: 'Ramesh Kumar', zone: 'District A', load: 4 },
  { id: 'FO-102', name: 'Sunita Sharma', zone: 'District B', load: 2 },
  { id: 'FO-103', name: 'Priya Verma', zone: 'District C', load: 3 },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Verified':
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

const getPriorityColor = (priority) => {
  return priority === 'High' ? '#D32F2F' : '#4CAF50';
};

export default function LMODashboard({ userRole }) {
  const [applications, setApplications] = useState(mockApplications);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  const handleOpenDialog = (app) => {
    setSelectedApp(app);
    setSelectedOfficer(app.assignedOfficer || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedApp(null);
    setSelectedOfficer('');
  };

  const handleAssignOfficer = () => {
    if (!selectedOfficer) return;
    setApplications(apps =>
      apps.map(app =>
        app.id === selectedApp.id
          ? { ...app, assignedOfficer: selectedOfficer, status: 'Assigned' }
          : app
      )
    );
    handleCloseDialog();
  };

  const handleApprove = (id) => {
    setApplications(apps =>
      apps.map(app =>
        app.id === id ? { ...app, status: 'Approved' } : app
      )
    );
  };

  const handleReject = (id) => {
    setApplications(apps =>
      apps.map(app =>
        app.id === id ? { ...app, status: 'Rejected' } : app
      )
    );
  };

  const filteredApps = applications
    .filter(app => {
      const matchesSearch = app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesUrgent = showUrgentOnly ? app.priority === 'High' : true;
      return matchesSearch && matchesStatus && matchesUrgent;
    })
    .sort((a, b) => (b.priority === 'High') - (a.priority === 'High'));

  const stats = [
    {
      title: 'Total Applications',
      value: applications.length.toString(),
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#0D47A1',
      subtitle: 'Submitted',
    },
    {
      title: 'Under Review',
      value: applications.filter(a => a.status === 'Under Review').length.toString(),
      icon: <PendingActionsIcon sx={{ fontSize: 40 }} />,
      color: '#FF9800',
      subtitle: 'In progress',
    },
    {
      title: 'Approved',
      value: applications.filter(a => a.status === 'Approved').length.toString(),
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: '#4CAF50',
      subtitle: 'This month',
    },
    {
      title: 'Verification Rate',
      value: '78%',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#1565C0',
      subtitle: 'Success rate',
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
          LMO Official Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Review applications, assign field officers, and manage verifications.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      {stat.subtitle}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color, opacity: 0.2 }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Urgent Alert */}
      {applications.some(a => a.priority === 'High' && a.status === 'Pending') && (
        <Card sx={{ mb: 4, bgcolor: '#FFF3E0', borderLeft: '4px solid #FF9800' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningAmberIcon sx={{ color: '#FF9800', fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#E65100' }}>
                  High Priority Applications
                </Typography>
                <Typography variant="body2" sx={{ color: '#E65100' }}>
                  {applications.filter(a => a.priority === 'High').length} applications require urgent attention.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Search"
              placeholder="Application ID or Company"
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Under Review">Under Review</MenuItem>
                <MenuItem value="Assigned">Assigned</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant={showUrgentOnly ? 'contained' : 'outlined'}
              fullWidth
              onClick={() => setShowUrgentOnly(!showUrgentOnly)}
              sx={{
                bgcolor: showUrgentOnly ? '#FF9800' : 'transparent',
                color: showUrgentOnly ? 'white' : '#FF9800',
              }}
            >
              Urgent Only
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0D47A1' }}>
            Applications for Review
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: '#F5F5F5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Application ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Instrument</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Assigned Officer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApps.map((app) => (
                  <TableRow
                    key={app.id}
                    sx={{
                      '&:hover': { bgcolor: '#F5F5F5' },
                      borderLeft: app.priority === 'High' ? '4px solid #D32F2F' : '4px solid #DDD',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#0D47A1' }}>
                      {app.id}
                    </TableCell>
                    <TableCell>{app.company}</TableCell>
                    <TableCell>{app.instrument}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.priority}
                        sx={{
                          bgcolor: getPriorityColor(app.priority),
                          color: 'white',
                          fontWeight: 600,
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={app.status}
                        color={getStatusColor(app.status)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {app.assignedOfficer ? (
                        <Typography variant="body2">{app.assignedOfficer}</Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => handleOpenDialog(app)}
                        sx={{ mr: 1 }}
                      >
                        Assign
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        color="success"
                        onClick={() => handleApprove(app.id)}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        onClick={() => handleReject(app.id)}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Field Officers Summary */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0D47A1' }}>
            Field Officers Overview
          </Typography>
          <Grid container spacing={2}>
            {fieldOfficers.map((officer) => (
              <Grid item xs={12} sm={6} md={4} key={officer.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {officer.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                      Zone: {officer.zone}
                    </Typography>
                    <Chip
                      icon={<AssignmentIcon />}
                      label={`${officer.load} Active Tasks`}
                      size="small"
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#0D47A1', color: 'white', fontWeight: 700 }}>
          Assign Officer - {selectedApp?.id}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedApp && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Application
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedApp.company} - {selectedApp.instrument}
                </Typography>
              </Box>
              <FormControl fullWidth>
                <InputLabel>Select Officer</InputLabel>
                <Select
                  value={selectedOfficer}
                  label="Select Officer"
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                >
                  {fieldOfficers.map((officer) => (
                    <MenuItem key={officer.id} value={officer.name}>
                      {officer.name} ({officer.zone}) - {officer.load} tasks
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleAssignOfficer}
            variant="contained"
            sx={{
              bgcolor: '#0D47A1',
              '&:hover': { bgcolor: '#1565C0' },
            }}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
