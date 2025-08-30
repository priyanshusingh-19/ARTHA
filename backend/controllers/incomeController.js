// backend/controllers/incomeController.js
const Income = require('../models/Income');

// @desc    Create a new income entry
// @route   POST /api/income
// @access  Private
const createIncome = async (req, res) => {
  const { source, amount, date } = req.body;
  const user = req.user._id; // User ID from protect middleware

  try {
    const income = await Income.create({
      user,
      source: source.trim(),
      amount,
      date: date || Date.now(),
    });
    res.status(201).json(income);
  } catch (error) {
    console.error('Error creating income:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all income entries for the authenticated user (optionally by month/year)
// @route   GET /api/income
// @access  Private
const getIncomes = async (req, res) => {
  const user = req.user._id;
  const { month, year } = req.query; // Allow filtering by month and year

  try {
    let query = { user };
    if (month) { // If month is provided, filter by month and year
      const startDate = new Date(year, parseInt(month) - 1, 1);
      const endDate = new Date(year, parseInt(month), 0);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (year) { // If only year is provided, filter by year
      const startOfYear = new Date(parseInt(year), 0, 1);
      const endOfYear = new Date(parseInt(year), 11, 31);
      query.date = { $gte: startOfYear, $lte: endOfYear };
    }

    const incomes = await Income.find(query).sort({ date: -1 }); // Sort by newest first
    res.json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update an income entry
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = async (req, res) => {
  const { source, amount, date } = req.body;
  const user = req.user._id;

  try {
    let income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income entry not found' });
    }

    // Ensure income entry belongs to the authenticated user
    if (income.user.toString() !== user.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this income entry' });
    }

    // Update fields
    income.source = source ? source.trim() : income.source;
    income.amount = amount !== undefined ? amount : income.amount;
    income.date = date || income.date;

    const updatedIncome = await income.save();
    res.json(updatedIncome);
  } catch (error) {
    console.error('Error updating income:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an income entry
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = async (req, res) => {
  const user = req.user._id;

  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income entry not found' });
    }

    // Ensure income entry belongs to the authenticated user
    if (income.user.toString() !== user.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this income entry' });
    }

    await Income.deleteOne({ _id: req.params.id });
    res.json({ message: 'Income entry removed' });
  } catch (error) {
    console.error('Error deleting income:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createIncome, getIncomes, updateIncome, deleteIncome };