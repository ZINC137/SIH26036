const express = require('express');
const {
  nominateOfficer,
  getOfficers,
  getLmoApplications,
  getLmoStats,
  assignFieldOfficer,
  reviewApplication,
  getLmoCertificates,
} = require('../controllers/lmoController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('lmo', 'admin'));

// Nominate Field Inspector for Circle / Zone
router.post('/officer/nominate', nominateOfficer);

// Get Field Officers in Jurisdiction
router.get('/officers', getOfficers);

// Applications Queue & Management
router.get('/applications', getLmoApplications);
router.get('/stats', getLmoStats);
router.post('/applications/:id/assign', assignFieldOfficer);
router.post('/applications/:id/review', reviewApplication);

// Certificate Registry & Verification History
router.get('/certificates', getLmoCertificates);

module.exports = router;
