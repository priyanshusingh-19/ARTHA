// backend/controllers/goalController.js
const Goal = require('../models/Goal');

// @desc    Create a new financial goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  const { name, targetAmount, targetDate } = req.body;
  const user = req.user._id;

  try {
    const goal = await Goal.create({
      user,
      name: name.trim(),
      targetAmount,
      targetDate: targetDate || null, // Optional
    });
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating goal:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all financial goals for the authenticated user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  const user = req.user._id;

  try {
    const goals = await Goal.find({ user }).sort({ createdAt: -1 }); // Sort by newest first
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a financial goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  const { name, targetAmount, currentAmount, targetDate, isCompleted } = req.body;
  const user = req.user._id;

  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Ensure goal belongs to the authenticated user
    if (goal.user.toString() !== user.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this goal' });
    }

    // Update fields
    goal.name = name ? name.trim() : goal.name;
    goal.targetAmount = targetAmount !== undefined ? targetAmount : goal.targetAmount;
    goal.currentAmount = currentAmount !== undefined ? currentAmount : goal.currentAmount;
    goal.targetDate = targetDate !== undefined ? targetDate : goal.targetDate;
    goal.isCompleted = isCompleted !== undefined ? isCompleted : goal.isCompleted;

    // Auto-complete if current amount meets or exceeds target
    if (goal.currentAmount >= goal.targetAmount) {
        goal.isCompleted = true;
    } else {
        goal.isCompleted = false; // If target changed or funds reduced
    }

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add funds to a specific goal
// @route   PUT /api/goals/add-funds/:id
// @access  Private
const addFundsToGoal = async (req, res) => {
    const { amount } = req.body;
    const user = req.user._id;

    if (amount === undefined || amount <= 0) {
        return res.status(400).json({ message: 'Amount to add must be a positive number.' });
    }

    try {
        let goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found.' });
        }

        if (goal.user.toString() !== user.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this goal.' });
        }

        goal.currentAmount += parseFloat(amount); // Add the new amount

        // Mark as completed if target reached
        if (goal.currentAmount >= goal.targetAmount) {
            goal.isCompleted = true;
        }

        const updatedGoal = await goal.save();
        res.json(updatedGoal);

    } catch (error) {
        console.error('Error adding funds to goal:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
};


// @desc    Delete a financial goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  const user = req.user._id;

  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Ensure goal belongs to the authenticated user
    if (goal.user.toString() !== user.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this goal' });
    }

    await Goal.deleteOne({ _id: req.params.id });
    res.json({ message: 'Goal removed' });
  } catch (error) {
    console.error('Error deleting goal:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createGoal, getGoals, updateGoal, addFundsToGoal, deleteGoal };