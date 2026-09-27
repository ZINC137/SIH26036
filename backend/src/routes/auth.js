const express = require('express');
const { register, verify, resendVerification, login, logout, me, saveProfile, activateFieldOfficer } = require('../controllers/authController');
const {
  submitApplication,
  getMyApplications,
  getApplicationById,
  getMyCertificates,
  getMyInstruments,
  getNotifications,
  markNotificationRead,
  getDashboardStats,
  searchRegistry,
} = require('../controllers/applicationController');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply rate limiter to all auth routes
router.use(authRateLimiter);

router.post('/register', register);
router.get('/verify', verify);
router.post('/resend-verification', resendVerification);
router.post('/login', login);
router.post('/logout', logout);
router.post('/field-officer/activate', activateFieldOfficer);

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
router.get('/search', authMiddleware, searchRegistry);
router.get('/dashboard-stats', authMiddleware, getDashboardStats);

module.exports = router;

