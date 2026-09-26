const express = require('express');
const {
  getAssignedTasks,
  getOfficerStats,
  submitInspection,
  getInspectionHistory,
} = require('../controllers/fieldOfficerController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('field_officer', 'lmo', 'admin'));

// Assigned Inspection Tasks
router.get('/tasks', getAssignedTasks);

// Officer Metrics
router.get('/stats', getOfficerStats);

// Submit Field Inspection & Issue Certificate
router.post('/applications/:id/inspect', submitInspection);

// Completed Inspection History
router.get('/history', getInspectionHistory);

module.exports = router;
