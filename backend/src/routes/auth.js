const express = require('express');
const { getDemoPortalCredentials, register, verify, resendVerification, login, logout, me, saveProfile, activateFieldOfficer } = require('../controllers/authController');
const {
  submitApplication,
  getMyApplications,
  getApplicationById,
  getMyCertificates,
  getMyInstruments,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  getDashboardStats,
  searchRegistry,
  validateCertificate,
} = require('../controllers/applicationController');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Authentication Endpoints (Rate Limited to defend against brute force & spam)
router.post('/register', authRateLimiter, register);
router.get('/verify', verify);
router.post('/resend-verification', authRateLimiter, resendVerification);
router.get('/demo-credentials', getDemoPortalCredentials);
router.post('/login', authRateLimiter, login);
router.post('/logout', logout);
router.post('/field-officer/activate', authRateLimiter, activateFieldOfficer);

// Public Statutory Certificate & QR Code Verification
router.get('/validate-certificate', validateCertificate);
router.post('/validate-certificate', validateCertificate);

// Protected routes
router.get('/me', authMiddleware, me);
router.post('/profile', authMiddleware, saveProfile);

// Application routes (protected)
router.post('/applications', authMiddleware, submitApplication);
router.get('/applications', authMiddleware, getMyApplications);
router.get('/applications/:id', authMiddleware, getApplicationById);
router.get('/certificates', authMiddleware, getMyCertificates);
router.get('/instruments', authMiddleware, getMyInstruments);
router.get('/notifications', authMiddleware, getNotifications);
router.put('/notifications/:id/read', authMiddleware, markNotificationRead);
router.delete('/notifications/:id', authMiddleware, deleteNotification);
router.get('/search', authMiddleware, searchRegistry);
router.get('/dashboard-stats', authMiddleware, getDashboardStats);

module.exports = router;
