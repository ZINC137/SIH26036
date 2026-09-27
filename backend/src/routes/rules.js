const express = require('express');
const {
  getCategories,
  getApplicableRules,
  checkEligibility,
  performTestCalculation,
  getAdminRuleSets,
  createVersion,
  getAuthorityMatrix,
} = require('../controllers/ruleController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Public & Authenticated Rule Lookups
router.get('/categories', getCategories);
router.get('/applicable', getApplicableRules);
router.get('/eligibility', checkEligibility);

// Authoritative Backend Test Calculation (Field Officers, GATC Labs, LMOs)
router.post('/calculate-test', authMiddleware, performTestCalculation);

// Admin Rule & Version Management
router.get('/admin/rulesets', authMiddleware, requireRole('admin'), getAdminRuleSets);
router.post('/admin/rulesets/:id/version', authMiddleware, requireRole('admin'), createVersion);
router.get('/admin/matrix', authMiddleware, requireRole('admin'), getAuthorityMatrix);

module.exports = router;
