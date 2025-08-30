// backend/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/expenses
// @desc    Get all expenses for the authenticated user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Find expenses only for the logged-in user (req.user._id is set by middleware)
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/expenses
// @desc    Add a new expense for the authenticated user
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, amount, category, date } = req.body;

  try {
    const newExpense = new Expense({
      user: req.user._id, // Associate expense with logged-in user
      title,
      amount,
      category,
      date: date || Date.now(),
    });

    const expense = await newExpense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense for the authenticated user
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Ensure the expense belongs to the logged-in user
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this expense' });
    }

    await Expense.deleteOne({ _id: req.params.id }); // Use deleteOne for Mongoose 6+
    res.json({ message: 'Expense removed' });

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(500).send('Server Error');
  }
});


// @route   PUT /api/expenses/:id
// @desc    Update an expense for the authenticated user
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { title, amount, category, date } = req.body;

  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Ensure the expense belongs to the logged-in user
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this expense' });
    }

    // Update fields
    expense.title = title || expense.title;
    expense.amount = amount !== undefined ? amount : expense.amount; // Allow 0
    expense.category = category || expense.category;
    expense.date = date || expense.date;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;