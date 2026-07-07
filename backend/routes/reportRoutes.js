const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/reportController');
const authenticateAdmin = require('../middleware/authenticateAdmin'); 

// POST /api/reports/generate
// Protected by authenticateAdmin
router.post('/generate', authenticateAdmin, generateReport);

module.exports = router;