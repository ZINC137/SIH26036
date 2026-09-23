import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Button, Chip, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ExploreIcon from '@mui/icons-material/Explore';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const portals = [
  {
    role: 'user',
    title: 'Public User Portal',
    subtitle: 'For Citizens & Businesses',
    description: 'Register your weighing and measuring instruments, submit verification applications, track status, and download digital certificates.',
    icon: PeopleIcon,
    color: '#E65100',
    gradient: 'linear-gradient(135deg, #FF6D00 0%, #E65100 100%)',
    lightBg: '#FFF3E0',
    border: '#FF9800',
    features: ['Instrument Registration', 'Application Tracking', 'Digital Certificates'],
    badge: 'Citizens',
  },
  {
    role: 'lmo',
    title: 'LMO Officer Portal',
    subtitle: 'Legal Metrology Officials',
    description: 'Process verification applications, issue digital certificates, manage workflows, and oversee compliance for your jurisdiction.',
    icon: VerifiedUserIcon,
    color: '#1B5E20',
    gradient: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
    lightBg: '#E8F5E9',
    border: '#4CAF50',
    features: ['Application Processing', 'Certificate Issuance', 'Compliance Management'],
    badge: 'Officials',
  },
  {
    role: 'field_officer',
    title: 'Field Officer Portal',
    subtitle: 'For On-Ground Inspectors',
    description: 'View your assigned inspection schedule, record on-site verification data, submit field reports, and access instrument history.',
    icon: ExploreIcon,
    color: '#4A148C',
    gradient: 'linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%)',
    lightBg: '#F3E5F5',
    border: '#9C27B0',
    features: ['Inspection Schedule', 'Field Reports', 'Instrument History'],
    badge: 'Inspectors',
  },
  {
    role: 'admin',
    title: 'Administrator Portal',
    subtitle: 'System Administration',
    description: 'Manage users and roles, configure system settings, monitor platform health, generate analytics reports, and oversee all operations.',
    icon: AdminPanelSettingsIcon,
    color: '#B71C1C',
    gradient: 'linear-gradient(135deg, #C62828 0%, #B71C1C 100%)',
    lightBg: '#FFEBEE',
    border: '#F44336',
    features: ['User Management', 'System Analytics', 'Platform Control'],
    badge: 'Admin',
  },
];

function PortalCard({ portal }) {
  const [hovered, setHovered] = useState(false);
  const Icon = portal.icon;

  const handleClick = () => {
    window.open(`/login?role=${portal.role}`, '_blank');
  };
  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        bgcolor: 'white',
        borderRadius: 4,
        p: 4,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: `2px solid ${hovered ? portal.border : '#E0E0E0'}`,
        boxShadow: hovered
          ? `0 16px 48px ${portal.border}33`
          : '0 4px 16px rgba(0,0,0,0.08)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent bar */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 5,
        background: portal.gradient,
      }} />

      {/* Badge */}
      <Chip
        label={portal.badge}
        size="small"
        sx={{
          alignSelf: 'flex-start',
          mb: 2,
          bgcolor: portal.lightBg,
          color: portal.color,
          fontWeight: 700,
          fontSize: '0.7rem',
          border: `1px solid ${portal.border}`,
        }}
      />

      {/* Icon */}
      <Box sx={{
        width: 72, height: 72, borderRadius: 3,
        background: portal.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mb: 2.5,
        boxShadow: `0 8px 24px ${portal.border}44`,
        transition: 'transform 0.3s',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
      }}>
        <Icon sx={{ color: 'white', fontSize: 36 }} />
      </Box>

      {/* Title */}
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 0.5, lineHeight: 1.2 }}>
        {portal.title}
      </Typography>
      <Typography variant="caption" sx={{ color: portal.color, fontWeight: 600, mb: 1.5, display: 'block' }}>
        {portal.subtitle}
      </Typography>

      {/* Description */}
      <Typography variant="body2" sx={{ color: '#616161', lineHeight: 1.7, mb: 3, flex: 1 }}>
        {portal.description}
      </Typography>

      {/* Features */}
      <Box sx={{ mb: 3 }}>
        {portal.features.map((f) => (
          <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: portal.color }} />
            <Typography variant="caption" sx={{ color: '#424242', fontWeight: 500 }}>{f}</Typography>
          </Box>
        ))}
      </Box>

      {/* CTA Button */}
      <Button
        variant="contained"
        endIcon={<ArrowForwardIcon sx={{ transition: 'transform 0.2s', transform: hovered ? 'translateX(4px)' : 'none' }} />}
        fullWidth
        sx={{
          background: portal.gradient,
          py: 1.5,
          borderRadius: 2,
          fontWeight: 700,
          fontSize: '0.95rem',
          boxShadow: `0 4px 16px ${portal.border}44`,
          '&:hover': { background: portal.gradient, opacity: 0.92 },
        }}
      >
        Enter Portal
      </Button>
    </Box>
  );
}

export default function LandingPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F0F4FF', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0A1628 0%, #0D47A1 100%)',
        color: 'white',
        py: 2,
        px: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5, lineHeight: 1.2 }}>
                Legal Metrology Verification System
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.75 }}>
                Ministry of Consumer Affairs, Food & Public Distribution — Government of India
              </Typography>
            </Box>
            <Chip
              label="SIH 2026"
              sx={{ bgcolor: '#FF9800', color: 'white', fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
        </Container>
      </Box>

      {/* ── Hero ── */}
      <Box sx={{
        background: 'linear-gradient(160deg, #0D47A1 0%, #1565C0 40%, #1976D2 100%)',
        color: 'white',
        py: { xs: 6, md: 10 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        {[...Array(3)].map((_, i) => (
          <Box key={i} sx={{
            position: 'absolute',
            width: [300, 500, 700][i],
            height: [300, 500, 700][i],
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }} />
        ))}

        <Container maxWidth="md" sx={{ position: 'relative' }}>
          <Chip
            label="🇮🇳  Digital India Initiative"
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600, mb: 3, backdropFilter: 'blur(8px)' }}
          />
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, lineHeight: 1.2, fontSize: { xs: '2rem', md: '3rem' } }}>
            Online Verification &amp;<br />Certification Platform
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, maxWidth: 600, mx: 'auto', lineHeight: 1.7 }}>
            A unified digital platform for weighing and measuring instrument verification,
            certification, and lifecycle management under the Legal Metrology Act, 2009.
          </Typography>
        </Container>
      </Box>

      {/* ── Portal Cards ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 }, flex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#1565C0', fontWeight: 700, letterSpacing: 2 }}>
            SELECT YOUR PORTAL
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A1A2E', mt: 1 }}>
            Who are you?
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575', mt: 1 }}>
            Choose the portal that matches your role to get started
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {portals.map((portal) => (
            <Grid item xs={12} sm={6} md={3} key={portal.role} sx={{ display: 'flex' }}>
              <PortalCard portal={portal} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── Stats Bar ── */}
      <Box sx={{ bgcolor: 'white', py: 4, borderTop: '1px solid #E0E0E0' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {[
              { value: '15L+', label: 'Instruments Registered' },
              { value: '2,800+', label: 'LMO Officers' },
              { value: '28', label: 'States & UTs Covered' },
              { value: '99.9%', label: 'Uptime SLA' },
            ].map((stat, i) => (
              <Grid item xs={6} md={3} key={i} sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0D47A1' }}>{stat.value}</Typography>
                <Typography variant="caption" sx={{ color: '#757575', fontWeight: 500 }}>{stat.label}</Typography>
                {i < 3 && <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />}
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ bgcolor: '#0A1628', color: 'white', py: 3, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © 2026 Legal Metrology Verification System &nbsp;|&nbsp; Ministry of Consumer Affairs &nbsp;|&nbsp; Government of India
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.5, display: 'block', mt: 0.5 }}>
            Smart India Hackathon 2026 — Problem Statement SIH26036
          </Typography>
        </Container>
      </Box>

    </Box>
  );
}
