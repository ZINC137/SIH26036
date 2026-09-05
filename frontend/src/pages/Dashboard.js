import React from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

const mockApplications = [
  {
    id: 'APP001',
    instrumentType: 'Electronic Scale',
    status: 'Pending',
    submittedDate: '2026-09-01',
    daysOld: 4,
  },
  {
    id: 'APP002',
    instrumentType: 'Weighing Balance',
    status: 'Under Review',
    submittedDate: '2026-08-28',
    daysOld: 8,
  },
  {
    id: 'APP003',
    instrumentType: 'Pressure Gauge',
    status: 'Approved',
    submittedDate: '2026-08-15',
    daysOld: 21,
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

export default function Dashboard({ userRole }) {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Applications',
      value: '12',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#0D47A1',
    },
    {
      title: 'Pending Review',
      value: '3',
      icon: <PendingActionsIcon sx={{ fontSize: 40 }} />,
      color: '#FF9800',
    },
    {
      title: 'Approved',
      value: '8',
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: '#4CAF50',
    },
    {
      title: 'Processing Rate',
      value: '92%',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#1565C0',
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Welcome back! Here's your verification system overview.
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
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color, opacity: 0.3 }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0D47A1' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#0D47A1',
                py: 1.5,
                '&:hover': { bgcolor: '#1565C0' },
              }}
              onClick={() => navigate('/register-instrument')}
            >
              Register New Instrument
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                borderColor: '#0D47A1',
                color: '#0D47A1',
                py: 1.5,
              }}
              onClick={() => navigate('/my-applications')}
            >
              View Applications
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                borderColor: '#0D47A1',
                color: '#0D47A1',
                py: 1.5,
              }}
              onClick={() => navigate('/certificates')}
            >
              Download Certificates
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Recent Applications */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0D47A1' }}>
            Recent Applications
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: '#F5F5F5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Application ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Instrument Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockApplications.map((app) => (
                  <TableRow key={app.id} sx={{ '&:hover': { bgcolor: '#F5F5F5' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{app.id}</TableCell>
                    <TableCell>{app.instrumentType}</TableCell>
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
                      <Typography variant="caption" sx={{ color: '#757575' }}>
                        {app.daysOld} days ago
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="text">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* System Status */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0D47A1' }}>
                System Status
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Database Connection: <Chip label="Active" color="success" size="small" />
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  API Server: <Chip label="Operational" color="success" size="small" />
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Last Sync: 2026-09-05 11:25 AM
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0D47A1' }}>
                Performance Metrics
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Average Processing Time
                </Typography>
                <LinearProgress variant="determinate" value={65} sx={{ height: 8, borderRadius: 4 }} />
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  4.2 days average
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  System Uptime
                </Typography>
                <LinearProgress variant="determinate" value={99.9} sx={{ height: 8, borderRadius: 4 }} />
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  99.9% this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
