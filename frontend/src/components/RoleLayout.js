import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Chip,
  useTheme,
  Button,
} from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';

const DRAWER_WIDTH = 280;

const ROLE_META = {
  user: {
    label: 'Public User Portal',
    roleTag: 'CITIZEN & TRADER',
    color: '#D97706',
    darkColor: '#B45309',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    bg: '#FFFBEB',
    accentBorder: '#FDE68A',
  },
  lmo: {
    label: 'LMO Officer Portal',
    roleTag: 'LEGAL METROLOGY OFFICIAL',
    color: '#15803D',
    darkColor: '#166534',
    gradient: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)',
    bg: '#F0FDF4',
    accentBorder: '#BBF7D0',
  },
  field_officer: {
    label: 'Field Officer Portal',
    roleTag: 'FIELD INSPECTOR',
    color: '#7E22CE',
    darkColor: '#6B21A8',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)',
    bg: '#FAF5FF',
    accentBorder: '#E9D5FF',
  },
  admin: {
    label: 'Administrator Portal',
    roleTag: 'SYSTEM ADMIN',
    color: '#B91C1C',
    darkColor: '#991B1B',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
    bg: '#FEF2F2',
    accentBorder: '#FECACA',
  },
};

export default function RoleLayout({ userRole, userEmail, onLogout, navItems }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const meta = ROLE_META[userRole] || ROLE_META.user;

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {}
    setAnchorEl(null);
    onLogout();
    navigate('/');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#06162D' }}>
      {/* Brand & Authority Header in Sidebar */}
      <Box sx={{ p: 2.75, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: 'rgba(255,255,255,0.1)',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AccountBalanceRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: '#94A3B8',
                fontWeight: 700,
                fontSize: '0.66rem',
                letterSpacing: '0.08em',
                display: 'block',
              }}
            >
              GOVERNMENT OF INDIA
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#FFFFFF', fontWeight: 800, lineHeight: 1.2 }}>
              Legal Metrology
            </Typography>
          </Box>
        </Box>

        {/* Portal Role Badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.25,
            borderRadius: '10px',
            bgcolor: 'rgba(255,255,255,0.05)',
            border: `1px solid rgba(255,255,255,0.1)`,
          }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: meta.color }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.82rem',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {meta.label}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#94A3B8',
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              {meta.roleTag}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Section */}
      <Box sx={{ flex: 1, py: 2, px: 1.5, overflowY: 'auto' }}>
        <Typography
          variant="caption"
          sx={{
            color: '#64748B',
            fontWeight: 800,
            fontSize: '0.68rem',
            letterSpacing: '0.08em',
            px: 1.5,
            mb: 1,
            display: 'block',
          }}
        >
          PORTAL NAVIGATION
        </Typography>

        <List disablePadding>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '10px',
                  mb: 0.75,
                  py: 1.1,
                  px: 1.75,
                  bgcolor: isActive ? `${meta.color}25` : 'transparent',
                  border: isActive ? `1px solid ${meta.color}66` : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isActive ? `${meta.color}35` : 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                    minWidth: 36,
                    '& svg': { fontSize: 20 },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: isActive ? '#FFFFFF !important' : 'rgba(255, 255, 255, 0.85) !important',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 700 : 500,
                    },
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      bgcolor: meta.color,
                      color: '#FFFFFF',
                      height: 20,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      borderRadius: '6px',
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Security Stamp / Compliance Footer in Sidebar */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(0,0,0,0.2)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <ShieldRoundedIcon sx={{ fontSize: 16, color: '#22C55E' }} />
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.72rem' }}>
            LM Act, 2009 Verified Session
          </Typography>
        </Box>

        {/* Signed-in User Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                background: meta.gradient,
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#FFFFFF',
              }}
            >
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {userEmail || 'admin@example.com'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem', display: 'block' }}>
                Active Session
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Log out of session">
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{
                color: '#94A3B8',
                bgcolor: 'rgba(255,255,255,0.05)',
                '&:hover': { color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.15)' },
              }}
            >
              <LogoutRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* ── Desktop Permanent Sidebar ── */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* ── Mobile Temporary Drawer ── */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* ── Main Layout (Header Bar + Content) ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        {/* Top App Bar across Desktop and Mobile */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            color: '#0F172A',
            borderBottom: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ display: { md: 'none' }, border: '1px solid #E2E8F0', borderRadius: '8px', p: 0.8 }}
              >
                <MenuRoundedIcon />
              </IconButton>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.98rem' }}>
                    {meta.label}
                  </Typography>
                  <Chip
                    label="GOV-SECURE"
                    size="small"
                    sx={{
                      bgcolor: meta.bg,
                      color: meta.darkColor,
                      border: `1px solid ${meta.accentBorder}`,
                      fontWeight: 800,
                      fontSize: '0.62rem',
                      height: 18,
                      display: { xs: 'none', sm: 'inline-flex' },
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: { xs: 'none', sm: 'block' } }}>
                  National Legal Metrology Verification System &nbsp;|&nbsp; Government of India
                </Typography>
              </Box>
            </Box>

            {/* Right Status Indicators & User Profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              {/* Server Online Badge */}
              <Box
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  alignItems: 'center',
                  gap: 0.8,
                  bgcolor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  px: 1.5,
                  py: 0.4,
                  borderRadius: '999px',
                }}
              >
                <FiberManualRecordRoundedIcon sx={{ fontSize: 10, color: '#16A34A' }} />
                <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700, fontSize: '0.74rem' }}>
                  Central Node: Online
                </Typography>
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/')}
                sx={{
                  color: '#475569',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'inline-flex' },
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
                }}
              >
                Portal Directory
              </Button>

              {/* Profile Avatar / Trigger */}
              <Box
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 0.5,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: '1px solid #E2E8F0',
                  '&:hover': { bgcolor: '#F8FAFC' },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: meta.gradient,
                    fontSize: '0.82rem',
                    fontWeight: 800,
                  }}
                >
                  {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left', pr: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', display: 'block', lineHeight: 1.1 }}>
                    {userEmail || 'admin@example.com'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem' }}>
                    {meta.roleTag}
                  </Typography>
                </Box>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                  sx: {
                    borderRadius: '12px',
                    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.1)',
                    minWidth: 200,
                    p: 0.5,
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Signed in as</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>{userEmail}</Typography>
                  <Chip
                    label={meta.label}
                    size="small"
                    sx={{ mt: 0.75, bgcolor: meta.bg, color: meta.darkColor, fontWeight: 700, fontSize: '0.65rem' }}
                  />
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={handleLogout} sx={{ color: '#EF4444', fontWeight: 600, borderRadius: '6px' }}>
                  <LogoutRoundedIcon sx={{ mr: 1, fontSize: 18 }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* ── Main Dynamic Portal View ── */}
        <Box
          component="main"
          sx={{
            flex: 1,
            bgcolor: '#F8FAFC',
            p: { xs: 2, sm: 3, md: 4 },
            overflowY: 'auto',
          }}
        >
          <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
