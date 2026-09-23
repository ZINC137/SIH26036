import React, { useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemIcon, ListItemText, Divider, IconButton, Avatar,
  Menu, MenuItem, Tooltip, Chip, useMediaQuery, useTheme,
} from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const DRAWER_WIDTH = 260;

const ROLE_META = {
  user:         { label: 'Public User',    color: '#E65100', gradient: 'linear-gradient(135deg, #FF6D00, #E65100)', bg: '#FFF3E0' },
  lmo:          { label: 'LMO Officer',    color: '#1B5E20', gradient: 'linear-gradient(135deg, #2E7D32, #1B5E20)', bg: '#E8F5E9' },
  field_officer:{ label: 'Field Officer',  color: '#4A148C', gradient: 'linear-gradient(135deg, #7B1FA2, #4A148C)', bg: '#F3E5F5' },
  admin:        { label: 'Administrator',  color: '#B71C1C', gradient: 'linear-gradient(135deg, #C62828, #B71C1C)', bg: '#FFEBEE' },
};

export default function RoleLayout({ userRole, userEmail, onLogout, navItems }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const meta = ROLE_META[userRole] || ROLE_META.user;

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5001/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    setAnchorEl(null);
    onLogout();
    navigate('/');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0A1628' }}>
      {/* Logo Area */}
      <Box sx={{ p: 2.5, background: meta.gradient }}>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.7rem', letterSpacing: 1 }}>
          LEGAL METROLOGY
        </Typography>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.2 }}>
          Verification System
        </Typography>
        <Chip
          label={meta.label}
          size="small"
          sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, fontSize: '0.65rem' }}
        />
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Navigation */}
      <List sx={{ flex: 1, py: 1.5, px: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              button
              key={item.label}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                borderRadius: 2, mb: 0.5,
                bgcolor: isActive ? `${meta.color}22` : 'transparent',
                borderLeft: isActive ? `3px solid ${meta.color}` : '3px solid transparent',
                '&:hover': { bgcolor: `${meta.color}15` },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? meta.color : 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{ '& .MuiListItemText-primary': { color: 'white !important', fontSize: '0.875rem', fontWeight: isActive ? 700 : 500 } }}
              />
              {item.badge && (
                <Chip label={item.badge} size="small" sx={{ bgcolor: meta.color, color: 'white', height: 18, fontSize: '0.6rem' }} />
              )}
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* User info at bottom */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, background: meta.gradient, fontSize: '0.875rem', fontWeight: 700 }}>
          {userEmail?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>Signed in as</Typography>
          <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userEmail}
          </Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton onClick={handleLogout} size="small" sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'white' } }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar (mobile) */}
      <AppBar
        position="fixed"
        sx={{
          display: { md: 'none' },
          background: meta.gradient,
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 700, fontSize: '1rem' }}>
            Legal Metrology System
          </Typography>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <AccountCircleIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled><Typography variant="caption">{userEmail}</Typography></MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}><LogoutIcon sx={{ mr: 1, fontSize: 18 }} />Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Permanent Drawer (desktop) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Temporary Drawer (mobile) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: '100vh',
          bgcolor: '#F0F4FF',
          pt: { xs: 8, md: 0 },
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
