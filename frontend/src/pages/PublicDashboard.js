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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';

const mockPersonalApplications = [
  {
    id: 'APP001',
    instrumentType: 'Electronic Scale',
    status: 'Pending',
    submittedDate: '2026-09-01',
  },
  {
    id: 'APP002',
    instrumentType: 'Weighing Balance',
    status: 'Under Review',
    submittedDate: '2026-08-28',
  },
  {
    id: 'APP003',
    instrumentType: 'Pressure Gauge',
    status: 'Approved',
    submittedDate: '2026-08-15',
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

export default function PublicDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Applications',
      value: '3',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#0D47A1',
    },
    {
      title: 'Pending / Review',
      value: '2',
      icon: <PendingActionsIcon sx={{ fontSize: 40 }} />,
      color: '#FF9800',
    },
    {
      title: 'Approved',
      value: '1',
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: '#4CAF50',
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
          My Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Manage your instrument applications and certificates.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
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
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddCircleOutlineIcon />}
              sx={{
                bgcolor: '#0D47A1',
                py: 1.5,
                '&:hover': { bgcolor: '#1565C0' },
              }}
              onClick={() => navigate('/register-instrument')}
            >
              Register New
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<VisibilityIcon />}
              sx={{
                borderColor: '#0D47A1',
                color: '#0D47A1',
                py: 1.5,
              }}
              onClick={() => navigate('/my-applications')}
            >
              My Applications
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<DownloadIcon />}
              sx={{
                borderColor: '#0D47A1',
                color: '#0D47A1',
                py: 1.5,
              }}
              onClick={() => navigate('/certificates')}
            >
              Certificates
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
                  <TableCell sx={{ fontWeight: 700 }}>Submitted Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockPersonalApplications.map((app) => (
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
                    <TableCell>{app.submittedDate}</TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="text" onClick={() => navigate('/my-applications')}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
}
