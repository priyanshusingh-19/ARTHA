// backend/models/Income.js
const mongoose = require('mongoose');

const IncomeSchema = mongoose.Schema({
  user: { // Link to the User who owns this income entry
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  source: { // The source of income (e.g., "Salary", "Freelance", "Gift")
    type: String,
    required: true,
    trim: true,
  },
  amount: { // The amount of income
    type: Number,
    required: true,
    min: 0, // Income amount should not be negative
  },
  date: { // The date the income was received
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Income', IncomeSchema);