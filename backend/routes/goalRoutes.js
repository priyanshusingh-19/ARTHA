// backend/routes/goalRoutes.js
const express = require('express');
const router = express.Router();
const { createGoal, getGoals, updateGoal, addFundsToGoal, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

// All goal routes are protected
router.route('/')
  .post(protect, createGoal) // Create goal
  .get(protect, getGoals);   // Get all goals

router.route('/:id')
  .put(protect, updateGoal)    // Update specific goal
  .delete(protect, deleteGoal); // Delete specific goal

router.put('/add-funds/:id', protect, addFundsToGoal); // Route for adding funds

module.exports = router;