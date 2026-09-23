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
  Avatar,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import BarChartIcon from '@mui/icons-material/BarChart';

const mockUsers = [
  {
    id: 'USR001',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    role: 'Field Officer',
    status: 'Active',
    joinDate: '2026-08-15',
    tasksCompleted: 12,
  },
  {
    id: 'USR002',
    name: 'Priya Singh',
    email: 'priya@example.com',
    role: 'LMO Official',
    status: 'Active',
    joinDate: '2026-08-10',
    tasksCompleted: 28,
  },
  {
    id: 'USR003',
    name: 'Amit Patel',
    email: 'amit@example.com',
    role: 'Field Officer',
    status: 'Active',
    joinDate: '2026-08-20',
    tasksCompleted: 8,
  },
  {
    id: 'USR004',
    name: 'Deepak Sharma',
    email: 'deepak@example.com',
    role: 'LMO Official',
    status: 'Inactive',
    joinDate: '2026-07-01',
    tasksCompleted: 35,
  },
];

const mockApplications = [
  { id: 'APP001', type: 'Electronic Scale', status: 'Approved', submittedBy: 'Public User', daysInSystem: 15 },
  { id: 'APP002', type: 'Weighing Balance', status: 'Under Review', submittedBy: 'Public User', daysInSystem: 8 },
  { id: 'APP003', type: 'Pressure Gauge', status: 'Pending', submittedBy: 'Public User', daysInSystem: 3 },
  { id: 'APP004', type: 'Thermometer', status: 'Approved', submittedBy: 'Public User', daysInSystem: 22 },
  { id: 'APP005', type: 'Flow Meter', status: 'Rejected', submittedBy: 'Public User', daysInSystem: 18 },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Active':
    case 'Approved':
      return 'success';
    case 'Under Review':
      return 'warning';
    case 'Pending':
      return 'default';
    case 'Inactive':
    case 'Rejected':
      return 'error';
    default:
      return 'default';
  }
};

export default function AdminDashboard({ userRole }) {
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleOpenUserDialog = (user) => {
    setSelectedUser(user);
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setSelectedUser(null);
  };

  const stats = [
    {
      title: 'Total Users',
      value: '156',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#0D47A1',
      subtitle: '4 admins',
    },
    {
      title: 'Active Users',
      value: '142',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      color: '#4CAF50',
      subtitle: '91% online',
    },
    {
      title: 'Total Applications',
      value: '324',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#FF9800',
      subtitle: '89 pending',
    },
    {
      title: 'System Health',
      value: '99.8%',
      icon: <BarChartIcon sx={{ fontSize: 40 }} />,
      color: '#1565C0',
      subtitle: 'Uptime',
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          System overview, user management, and application monitoring.
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

      {/* Admin Actions */}
      <Card sx={{ mb: 4, p: 3, borderLeft: '4px solid #0D47A1' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0D47A1' }}>
          Admin Tools
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<PeopleIcon />}
              sx={{
                bgcolor: '#0D47A1',
                py: 1.5,
                '&:hover': { bgcolor: '#1565C0' },
              }}
            >
              Manage Users
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<StorageIcon />}
              sx={{
                bgcolor: '#FF9800',
                py: 1.5,
                '&:hover': { bgcolor: '#F57C00' },
              }}
            >
              Backups
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<BarChartIcon />}
              sx={{
                borderColor: '#0D47A1',
                color: '#0D47A1',
                py: 1.5,
              }}
            >
              Generate Reports
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<SecurityIcon />}
              sx={{
                borderColor: '#0D47A1',
                color: '#0D47A1',
                py: 1.5,
              }}
            >
              System Logs
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* System Alerts */}
      <Card sx={{ mb: 4, bgcolor: '#FFF3E0', borderLeft: '4px solid #FF9800' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WarningAmberIcon sx={{ color: '#FF9800', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#E65100' }}>
                System Notifications
              </Typography>
              <Typography variant="body2" sx={{ color: '#E65100' }}>
                89 applications pending review • 2 users inactive for 7+ days • Database at 78% capacity
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Users Management Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0D47A1' }}>
            User Management
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: '#F5F5F5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>User ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name & Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tasks Completed</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{
                      '&:hover': { bgcolor: '#F5F5F5' },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#0D47A1' }}>
                      {user.id}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#0D47A1' }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#757575' }}>
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={user.role} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.tasksCompleted}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => handleOpenUserDialog(user)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Applications Overview */}
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
                  <TableCell sx={{ fontWeight: 700 }}>Days in System</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Submitted By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockApplications.map((app) => (
                  <TableRow key={app.id} sx={{ '&:hover': { bgcolor: '#F5F5F5' } }}>
                    <TableCell sx={{ fontWeight: 600, color: '#0D47A1' }}>
                      {app.id}
                    </TableCell>
                    <TableCell>{app.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.status}
                        color={getStatusColor(app.status)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{app.daysInSystem}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{app.submittedBy}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* System Performance Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
                System Performance
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Server CPU Usage</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    42%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={42}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Database Connections</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    156/200
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={78}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Storage Usage</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    245 GB / 500 GB
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={49}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0D47A1' }}>
                Application Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 2, borderBottom: '1px solid #EEE' }}>
                  <Typography variant="body2">Total Submitted</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D47A1' }}>
                    324
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 2, borderBottom: '1px solid #EEE' }}>
                  <Typography variant="body2">Approved</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                    185 (57%)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 2, borderBottom: '1px solid #EEE' }}>
                  <Typography variant="body2">Under Review</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#FF9800' }}>
                    89 (27%)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Rejected</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#D32F2F' }}>
                    50 (15%)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Edit Dialog */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#0D47A1', color: 'white', fontWeight: 700 }}>
          Edit User - {selectedUser?.name}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  User ID
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedUser.id}
                </Typography>
              </Box>
              <TextField
                label="Name"
                defaultValue={selectedUser.name}
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label="Email"
                defaultValue={selectedUser.email}
                fullWidth
                variant="outlined"
                size="small"
              />
              <Box>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Role
                </Typography>
                <Chip label={selectedUser.role} sx={{ mt: 1 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                  Current Status
                </Typography>
                <Chip
                  label={selectedUser.status}
                  color={getStatusColor(selectedUser.status)}
                  sx={{ mt: 1 }}
                />
              </Box>
              <TextField
                label="Admin Notes"
                multiline
                rows={3}
                placeholder="Add notes about this user..."
                variant="outlined"
                fullWidth
                size="small"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseUserDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleCloseUserDialog}
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
