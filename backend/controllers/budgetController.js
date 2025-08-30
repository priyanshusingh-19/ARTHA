// backend/controllers/budgetController.js
const Budget = require('../models/Budget');

// @desc    Create a new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  const { category, amount, month, year } = req.body;
  const user = req.user._id; // User ID from protect middleware

  try {
    // This explicit check is good practice, but the unique index also enforces it.
    const existingBudget = await Budget.findOne({ user, category: category.toLowerCase(), month, year });

    if (existingBudget) {
      return res.status(400).json({ message: 'Budget for this category and month/year already exists.' });
    }

    const budget = await Budget.create({
      user,
      category: category.trim(),
      amount,
      month,
      year,
    });
    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error.message);
    // Handle MongoDB duplicate key error specifically for create
    if (error.code === 11000) { // MongoDB duplicate key error code
      return res.status(400).json({ message: 'A budget for this category and month/year already exists.' });
    }
    // Fallback to generic server error for other types of errors
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get budgets for the authenticated user (optionally by month/year)
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  const user = req.user._id;
  const { month, year } = req.query; // Allow filtering by month and year

  try {
    let query = { user };
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const budgets = await Budget.find(query).sort({ year: 1, month: 1, category: 1 });
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  const { category, amount, month, year } = req.body; // Allow partial updates, but category, month, year should ideally not change
  const user = req.user._id;

  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Ensure budget belongs to the authenticated user
    if (budget.user.toString() !== user.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this budget' });
    }

    // Update fields
    budget.category = category ? category.trim() : budget.category;
    budget.amount = amount !== undefined ? amount : budget.amount;
    budget.month = month !== undefined ? month : budget.month;
    budget.year = year !== undefined ? year : budget.year;

    // If category, month, or year are changed, need to re-check unique constraint
    const updatedBudget = await budget.save();
    res.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error.message);
    // Handle unique index violation specifically for PUT requests
    if (error.code === 11000) { // MongoDB duplicate key error code
      return res.status(400).json({ message: 'A budget for this category and month/year already exists.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  const user = req.user._id;

  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Ensure budget belongs to the authenticated user
    if (budget.user.toString() !== user.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this budget' });
    }

    await Budget.deleteOne({ _id: req.params.id });
    res.json({ message: 'Budget removed' });
  } catch (error) {
    console.error('Error deleting budget:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createBudget, getBudgets, updateBudget, deleteBudget };