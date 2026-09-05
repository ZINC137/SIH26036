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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import MapIcon from '@mui/icons-material/Map';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const mockVerifications = [
  {
    id: 'VER001',
    instrumentType: 'Electronic Scale',
    location: 'Mumbai, Shop #45',
    status: 'Pending',
    priority: 'High',
    assignedDate: '2026-09-03',
    daysOld: 2,
    documentsMissing: 2,
  },
  {
    id: 'VER002',
    instrumentType: 'Weighing Balance',
    location: 'Delhi, Market Zone B',
    status: 'In Progress',
    priority: 'High',
    assignedDate: '2026-09-01',
    daysOld: 4,
    documentsMissing: 0,
  },
  {
    id: 'VER003',
    instrumentType: 'Pressure Gauge',
    location: 'Bangalore, Warehouse 3',
    status: 'Photos Submitted',
    priority: 'Medium',
    assignedDate: '2026-08-28',
    daysOld: 8,
    documentsMissing: 1,
  },
  {
    id: 'VER004',
    instrumentType: 'Thermometer',
    location: 'Hyderabad, Lab Center',
    status: 'Verified',
    priority: 'Low',
    assignedDate: '2026-08-20',
    daysOld: 16,
    documentsMissing: 0,
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Verified':
      return 'success';
    case 'In Progress':
      return 'info';
    case 'Photos Submitted':
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
  switch (priority) {
    case 'High':
      return '#D32F2F';
    case 'Medium':
      return '#FF9800';
    case 'Low':
      return '#4CAF50';
    default:
      return '#0D47A1';
  }
};

export default function FieldOfficerDashboard({ userRole }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);

  const handleOpenDialog = (verification) => {
    setSelectedVerification(verification);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVerification(null);
  };

  const stats = [
    {
      title: 'Assigned Tasks',
      value: '12',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#0D47A1',
      subtitle: '4 High Priority',
    },
    {
      title: 'Verified',
      value: '8',
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: '#4CAF50',
      subtitle: 'This month',
    },
    {
      title: 'In Progress',
      value: '3',
      icon: <PendingActionsIcon sx={{ fontSize: 40 }} />,
      color: '#FF9800',
      subtitle: 'Awaiting photos',
    },
    {
      title: 'Completion Rate',
      value: '67%',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#1565C0',
      subtitle: 'Monthly average',
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
          Field Officer Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Manage your field verification assignments and track completion status.
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

      {/* Quick Actions */}
      <Card sx={{ mb: 4, p: 3, borderLeft: '4px solid #0D47A1' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0D47A1' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<MapIcon />}
              sx={{
                bgcolor: '#0D47A1',
                py: 1.5,
                '&:hover': { bgcolor: '#1565C0' },
              }}
            >
              View Map
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<CameraAltIcon />}
              sx={{
                bgcolor: '#FF9800',
                py: 1.5,
                '&:hover': { bgcolor: '#F57C00' },
              }}
            >
              Upload Photos
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<DocumentScannerIcon />}
              sx={{
                borderColor: '#0D47A1',
                color: '#0D47A1',
                py: 1.5,
              }}
            >
              Submit Documents
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                borderColor: '#0D47A1',
                color: '#0D47A1',
                py: 1.5,
              }}
            >
              Mark Verified
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Alerts Section */}
      {mockVerifications.some((v) => v.priority === 'High' && v.status !== 'Verified') && (
        <Card sx={{ mb: 4, bgcolor: '#FFF3E0', borderLeft: '4px solid #FF9800' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningAmberIcon sx={{ color: '#FF9800', fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#E65100' }}>
                  High Priority Tasks Pending
                </Typography>
                <Typography variant="body2" sx={{ color: '#E65100' }}>
                  You have 4 high-priority verification tasks. Please prioritize these assignments.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Verification Tasks Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0D47A1' }}>
            Your Verification Assignments
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: '#F5F5F5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Verification ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Instrument & Location</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Days</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockVerifications.map((verification) => (
                  <TableRow
                    key={verification.id}
                    sx={{
                      '&:hover': { bgcolor: '#F5F5F5' },
                      borderLeft:
                        verification.priority === 'High'
                          ? `4px solid #D32F2F`
                          : `4px solid #DDD`,
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#0D47A1' }}>
                      {verification.id}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {verification.instrumentType}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#757575', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
                        >
                          <LocationOnIcon sx={{ fontSize: 14 }} />
                          {verification.location}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={verification.priority}
                        sx={{
                          bgcolor: getPriorityColor(verification.priority),
                          color: 'white',
                          fontWeight: 600,
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={verification.status}
                        color={getStatusColor(verification.status)}
                        variant="outlined"
                        size="small"
                        icon={
                          verification.status === 'Verified' ? (
                            <ThumbUpIcon sx={{ fontSize: 14 }} />
                          ) : undefined
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{verification.daysOld}</Typography>
                      <Typography variant="caption" sx={{ color: '#757575' }}>
                        assigned
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => handleOpenDialog(verification)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Performance & Activity Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
                Performance This Month
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tasks Completed</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    8/12
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={67}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Average Verification Time</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    3.2 days
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Department average: 4.1 days
                </Typography>
              </Box>
              <Box sx={{ p: 2, bgcolor: '#E8F5E9', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#2E7D32' }}>
                  ✓ You're performing above department average!
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
                Recent Activity
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ pb: 2, borderBottom: '1px solid #EEE' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    VER004 - Marked as Verified
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    2 hours ago
                  </Typography>
                </Box>
                <Box sx={{ pb: 2, borderBottom: '1px solid #EEE' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    VER003 - Photos Uploaded
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    1 day ago
                  </Typography>
                </Box>
                <Box sx={{ pb: 2, borderBottom: '1px solid #EEE' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    VER002 - Started Verification
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    3 days ago
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    VER001 - Assigned by Admin
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    4 days ago
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#0D47A1', color: 'white', fontWeight: 700 }}>
          Verification Details - {selectedVerification?.id}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedVerification && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Instrument Type
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedVerification.instrumentType}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Location
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedVerification.location}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedVerification.status}
                    color={getStatusColor(selectedVerification.status)}
                    variant="outlined"
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Priority
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedVerification.priority}
                    sx={{
                      bgcolor: getPriorityColor(selectedVerification.priority),
                      color: 'white',
                    }}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Documents Status
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {selectedVerification.documentsMissing === 0
                    ? '✓ All documents received'
                    : `⚠ ${selectedVerification.documentsMissing} document(s) missing`}
                </Typography>
              </Box>
              <TextField
                multiline
                rows={3}
                placeholder="Add notes or observations..."
                variant="outlined"
                fullWidth
                size="small"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              bgcolor: '#0D47A1',
              '&:hover': { bgcolor: '#1565C0' },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
