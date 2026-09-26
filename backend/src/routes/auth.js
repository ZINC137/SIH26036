const express = require('express');
const { register, verify, login, logout, me, saveProfile, activateFieldOfficer } = require('../controllers/authController');
const {
  submitApplication,
  getMyApplications,
  getApplicationById,
  getMyCertificates,
  getDashboardStats,
} = require('../controllers/applicationController');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply rate limiter to all auth routes
router.use(authRateLimiter);

router.post('/register', register);
router.get('/verify', verify);
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
router.get('/dashboard-stats', authMiddleware, getDashboardStats);

module.exports = router;

