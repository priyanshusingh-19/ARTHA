// backend/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { getFinancialSummary } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware'); // All AI routes are protected

// @route   GET /api/ai/summary
// @desc    Get AI-generated financial summary for a given month/year
// @access  Private
router.get('/summary', protect, getFinancialSummary);

module.exports = router;