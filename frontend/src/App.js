import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import { LanguageProvider } from './i18n/LanguageContext';

// ── Priyanshu's new components ──────────────────────────────────────────────
import RoleLayout from './components/RoleLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicDashboard from './pages/PublicDashboard';

// ── Role-based dashboards (Priyanshu) ───────────────────────────────────────
import UserDashboard from './pages/dashboards/UserDashboard';
import LMODashboard from './pages/dashboards/LMODashboard';
import FieldOfficerDashboard from './pages/dashboards/FieldOfficerDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';

// ── Sub-pages: User portal ───────────────────────────────────────────────────
import UserApply from './pages/dashboards/user/UserApply';
import UserApplications from './pages/dashboards/user/UserApplications';
import UserCertificates from './pages/dashboards/user/UserCertificates';

// ── Sub-pages: LMO portal ────────────────────────────────────────────────────
import LMOPending from './pages/dashboards/lmo/LMOPending';
import LMOOfficers from './pages/dashboards/lmo/LMOOfficers';
import LMOCertificates from './pages/dashboards/lmo/LMOCertificates';

// ── Sub-pages: Field Officer portal ─────────────────────────────────────────
import FOReport from './pages/dashboards/field_officer/FOReport';
import FOHistory from './pages/dashboards/field_officer/FOHistory';

// ── Sub-pages: Admin portal ──────────────────────────────────────────────────
import AdminUsers from './pages/dashboards/admin/AdminUsers';
import AdminCertificates from './pages/dashboards/admin/AdminCertificates';
import AdminRules from './pages/dashboards/admin/AdminRules';

// GATC Portal
import GATCDashboard from './pages/dashboards/GATCDashboard';
import GATCQueue from './pages/dashboards/gatc/GATCQueue';
import GATCHistory from './pages/dashboards/gatc/GATCHistory';
import { authFetch, setAuthToken } from './config/api';

// ── Shared sub-pages ─────────────────────────────────────────────────────────
import PortalSettings from './pages/dashboards/shared/PortalSettings';

// ── Legacy pages (from main branch) — kept to avoid breaking existing work ──
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RegisterInstrument from './pages/RegisterInstrument';
import MyApplications from './pages/MyApplications';
import Certificates from './pages/Certificates';
import Settings from './pages/Settings';

// ── Icons for nav ────────────────────────────────────────────────────────────
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GavelIcon from '@mui/icons-material/Gavel';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import GroupIcon from '@mui/icons-material/Group';
import VerifiedIcon from '@mui/icons-material/Verified';
import TodayIcon from '@mui/icons-material/Today';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import SecurityIcon from '@mui/icons-material/Security';

// ── Navigation items per role ────────────────────────────────────────────────
const NAV = {
  user: [
    { label: 'Dashboard',       icon: <DashboardIcon />,  path: '/dashboard/user' },
    { label: 'New Application', icon: <AddCircleIcon />,  path: '/dashboard/user/apply' },
    { label: 'My Applications', icon: <AssignmentIcon />, path: '/dashboard/user/applications' },
    { label: 'Certificates',    icon: <DownloadIcon />,   path: '/dashboard/user/certificates' },
    { label: 'Settings',        icon: <SettingsIcon />,   path: '/dashboard/user/settings' },
  ],
  lmo: [
    { label: 'Dashboard',             icon: <DashboardIcon />,      path: '/dashboard/lmo' },
    { label: 'Pending Queue',         icon: <PendingActionsIcon />, path: '/dashboard/lmo/pending' },
    { label: 'Field Officers',        icon: <GroupIcon />,          path: '/dashboard/lmo/officers' },
    { label: 'Certificates & History', icon: <VerifiedIcon />,       path: '/dashboard/lmo/certificates' },
    { label: 'Settings',              icon: <SettingsIcon />,       path: '/dashboard/lmo/settings' },
  ],
  field_officer: [
    { label: 'Dashboard',        icon: <DashboardIcon />,  path: '/dashboard/field-officer' },
    { label: "Today's Schedule", icon: <TodayIcon />,      path: '/dashboard/field-officer/schedule' },
    { label: 'Submit Report',    icon: <UploadFileIcon />, path: '/dashboard/field-officer/report' },
    { label: 'Report History',   icon: <HistoryIcon />,    path: '/dashboard/field-officer/history' },
    { label: 'Settings',         icon: <SettingsIcon />,   path: '/dashboard/field-officer/settings' },
  ],
  admin: [
    { label: 'Dashboard',       icon: <DashboardIcon />, path: '/dashboard/admin' },
    { label: 'User Management', icon: <PeopleIcon />,    path: '/dashboard/admin/users' },
    { label: 'Analytics',       icon: <BarChartIcon />,  path: '/dashboard/admin/analytics' },
    { label: 'Rule Management', icon: <GavelIcon />,     path: '/dashboard/admin/rules' },
    { label: 'Certificates',    icon: <VerifiedIcon />,  path: '/dashboard/admin/certificates' },
    { label: 'Security Logs',   icon: <SecurityIcon />,  path: '/dashboard/admin/logs' },
    { label: 'System Settings', icon: <SettingsIcon />,  path: '/dashboard/admin/settings' },
  ],
  gatc: [
    { label: 'Dashboard',          icon: <DashboardIcon />,      path: '/dashboard/gatc' },
    { label: 'Testing Queue',      icon: <PendingActionsIcon />, path: '/dashboard/gatc/tasks' },
    { label: 'Testing History',    icon: <VerifiedIcon />,       path: '/dashboard/gatc/history' },
    { label: 'Settings',           icon: <SettingsIcon />,       path: '/dashboard/gatc/settings' },
  ],
};

// Role → home path mapping
const ROLE_HOME = {
  user: '/dashboard/user',
  lmo: '/dashboard/lmo',
  field_officer: '/dashboard/field-officer',
  gatc: '/dashboard/gatc',
  admin: '/dashboard/admin',
};

// ── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: '#0F2B4E', light: '#1E3A8A', dark: '#06162D' },
    secondary: { main: '#D97706', light: '#F59E0B', dark: '#B45309' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#475569' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: { borderRadius: 12 },
});

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || null;
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('userEmail') || '';
  });

  // Check backend session on mount
  React.useEffect(() => {
    authFetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Unauthenticated');
      })
      .then((data) => {
        if (data.user) {
          setIsLoggedIn(true);
          setUserRole(data.user.role);
          setUserEmail(data.user.email);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userRole', data.user.role);
          localStorage.setItem('userEmail', data.user.email);
        }
      })
      .catch(() => {
        // Only reset if backend session is completely dead
      });
  }, []);

  const handleLogin = (role, email, token) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserEmail(email);
    if (token) setAuthToken(token);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', email);
  };

  const handleLogout = () => {
    authFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setAuthToken(null);
    setIsLoggedIn(false);
    setUserRole(null);
    setUserEmail('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
  };

  // Helper: wrap a route group in RoleLayout with strict role validation
  const portalLayout = (role) => {
    if (userRole && userRole !== role) {
      return <Navigate to={ROLE_HOME[userRole] || '/dashboard/user'} replace />;
    }
    return (
      <RoleLayout
        userRole={role}
        userEmail={userEmail}
        onLogout={handleLogout}
        navItems={NAV[role]}
      />
    );
  };

  return (
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* ── Public routes ─────────────────────────────────────── */}
            <Route path="/"            element={<LandingPage />} />
            <Route path="/login"       element={<Login onLogin={handleLogin} />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/public"      element={<PublicDashboard />} />

            {isLoggedIn ? (
              <>
                {/* ── USER PORTAL ─────────────────────────────────── */}
                <Route element={portalLayout('user')}>
                  <Route path="/dashboard/user"              element={<UserDashboard userEmail={userEmail} />} />
                  <Route path="/dashboard/user/apply"        element={<UserApply />} />
                  <Route path="/dashboard/user/applications" element={<UserApplications />} />
                  <Route path="/dashboard/user/certificates" element={<UserCertificates />} />
                  <Route path="/dashboard/user/settings"     element={<PortalSettings userRole="user" userEmail={userEmail} />} />
                </Route>

                {/* ── LMO PORTAL ──────────────────────────────────── */}
                <Route element={portalLayout('lmo')}>
                  <Route path="/dashboard/lmo"              element={<LMODashboard userEmail={userEmail} />} />
                  <Route path="/dashboard/lmo/pending"      element={<LMOPending />} />
                  <Route path="/dashboard/lmo/officers"     element={<LMOOfficers />} />
                  <Route path="/dashboard/lmo/certificates" element={<LMOCertificates />} />
                  <Route path="/dashboard/lmo/settings"     element={<PortalSettings userRole="lmo" userEmail={userEmail} />} />
                </Route>

                {/* ── FIELD OFFICER PORTAL ────────────────────────── */}
                <Route element={portalLayout('field_officer')}>
                  <Route path="/dashboard/field-officer"          element={<FieldOfficerDashboard userEmail={userEmail} />} />
                  <Route path="/dashboard/field-officer/schedule" element={<FieldOfficerDashboard userEmail={userEmail} />} />
                  <Route path="/dashboard/field-officer/report"   element={<FOReport />} />
                  <Route path="/dashboard/field-officer/history"  element={<FOHistory />} />
                  <Route path="/dashboard/field-officer/settings" element={<PortalSettings userRole="field_officer" userEmail={userEmail} />} />
                </Route>

                {/* ── ADMIN PORTAL ────────────────────────────────── */}
                <Route element={portalLayout('admin')}>
                  <Route path="/dashboard/admin"           element={<AdminDashboard userEmail={userEmail} />} />
                  <Route path="/dashboard/admin/users"     element={<AdminUsers />} />
                  <Route path="/dashboard/admin/analytics" element={<AdminDashboard userEmail={userEmail} />} />
                  <Route path="/dashboard/admin/rules"     element={<AdminRules />} />
                  <Route path="/dashboard/admin/certificates" element={<AdminCertificates />} />
                  <Route path="/dashboard/admin/logs"      element={<AdminDashboard userEmail={userEmail} />} />
                  <Route path="/dashboard/admin/settings"  element={<PortalSettings userRole="admin" userEmail={userEmail} />} />
                </Route>

                {/* ── GATC PORTAL ── */}
                <Route element={portalLayout('gatc')}>
                  <Route path="/dashboard/gatc"          element={<GATCDashboard userEmail={userEmail} />} />
                  <Route path="/dashboard/gatc/tasks"    element={<GATCQueue userEmail={userEmail} />} />
                  <Route path="/dashboard/gatc/history"  element={<GATCHistory userEmail={userEmail} />} />
                  <Route path="/dashboard/gatc/settings" element={<PortalSettings userRole="gatc" userEmail={userEmail} />} />
                </Route>

                {/* Keep legacy URLs working for existing users. */}
                <Route element={<Layout userRole={userRole} onLogout={handleLogout} />}>
                  <Route path="/register-instrument" element={<RegisterInstrument />} />
                  <Route path="/my-applications"     element={<MyApplications />} />
                  <Route path="/certificates"        element={<Certificates />} />
                  <Route path="/settings"            element={<Settings />} />
                  <Route path="/legacy-dashboard"    element={<Dashboard userRole={userRole} />} />
                </Route>

                {/* Redirect /dashboard → role home */}
                <Route path="/dashboard" element={<Navigate to={ROLE_HOME[userRole] || '/dashboard/user'} />} />
                <Route path="*"          element={<Navigate to={ROLE_HOME[userRole] || '/dashboard/user'} />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/" />} />
            )}
          </Routes>
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
