const express = require('express');
const router = express.Router();

const authenticateAdmin = require('../middleware/authenticateAdmin');
const { generateReport } = require('../controllers/reportController');

router.post('/generate', authenticateAdmin, generateReport);

module.exports = router;