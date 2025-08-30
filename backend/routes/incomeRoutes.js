// backend/routes/incomeRoutes.js
const express = require('express');
const router = express.Router();
const { createIncome, getIncomes, updateIncome, deleteIncome } = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');

// All income routes are protected
router.route('/')
  .post(protect, createIncome) // Create income
  .get(protect, getIncomes);   // Get all income entries (or by month/year)

router.route('/:id')
  .put(protect, updateIncome)    // Update specific income
  .delete(protect, deleteIncome); // Delete specific income

module.exports = router;