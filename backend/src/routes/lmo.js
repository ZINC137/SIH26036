const express = require('express');
const {
  nominateOfficer,
  getOfficers,
} = require('../controllers/lmoController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('lmo', 'admin'));

// Nominate Field Inspector for Circle / Zone
router.post('/officer/nominate', nominateOfficer);

// Get Field Officers in Jurisdiction
router.get('/officers', getOfficers);

module.exports = router;
