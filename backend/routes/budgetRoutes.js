// backend/routes/budgetRoutes.js
const express = require('express');
const router = express.Router();
const { createBudget, getBudgets, updateBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

// All budget routes are protected
router.route('/')
  .post(protect, createBudget) // Create budget
  .get(protect, getBudgets);   // Get all budgets (or by month/year)

router.route('/:id')
  .put(protect, updateBudget)    // Update specific budget
  .delete(protect, deleteBudget); // Delete specific budget

module.exports = router;