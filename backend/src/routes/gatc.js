const express = require('express');
const {
  getGatcTasks,
  getGatcStats,
  submitGatcInspection,
  getGatcHistory,
} = require('../controllers/gatcController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('gatc', 'admin', 'lmo'));

// GATC Assigned Verification Tasks
router.get('/tasks', getGatcTasks);

// GATC Centre Metrics
router.get('/stats', getGatcStats);

// Submit GATC Verification & Laboratory Test Report
router.post('/applications/:id/inspect', submitGatcInspection);
router.post('/tasks/:id/report', submitGatcInspection);

// Completed GATC Verification History
router.get('/history', getGatcHistory);

module.exports = router;
