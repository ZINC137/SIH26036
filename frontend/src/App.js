import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterInstrument from './pages/RegisterInstrument';
import MyApplications from './pages/MyApplications';
import Certificates from './pages/Certificates';
import Settings from './pages/Settings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0D47A1',
      light: '#1565C0',
    },
    secondary: {
      main: '#FF9800',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#0D47A1',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#0D47A1',
    },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />
          {isLoggedIn ? (
            <Route
              element={<Layout userRole={userRole} onLogout={handleLogout} />}
            >
              <Route path="/dashboard" element={<Dashboard userRole={userRole} />} />
              <Route path="/register-instrument" element={<RegisterInstrument />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
