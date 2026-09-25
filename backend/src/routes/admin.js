const express = require('express');
const {
  appointLMO,
  listLMOs,
  getPendingInspectorApprovals,
  clearInspector,
  getAuditLogs,
  getAllUsers,
  updateUserStatus,
} = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes require valid authentication and admin privileges
router.use(authMiddleware);
router.use(requireRole('admin'));

// LMO appointment & registry
router.post('/lmo/appoint', appointLMO);
router.get('/lmo/list', listLMOs);

// Field Officer multi-tier verification & security clearance
router.get('/officers/pending-approvals', getPendingInspectorApprovals);
router.post('/officers/clear', clearInspector);

// System security audit logs
router.get('/audit-logs', getAuditLogs);

// System user management
router.get('/users', getAllUsers);
router.post('/users/status', updateUserStatus);

module.exports = router;
