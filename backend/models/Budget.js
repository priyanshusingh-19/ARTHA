// backend/models/Budget.js
const mongoose = require('mongoose');

const BudgetSchema = mongoose.Schema({
  user: { // Link to the User who owns this budget
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  category: { // The category this budget applies to (e.g., "Food & Dining")
    type: String,
    required: true,
    trim: true,
  },
  amount: { // The budgeted amount for this category in this period
    type: Number,
    required: true,
    min: 0, // Budget amount should not be negative
  },
  month: { // The month of the budget (1-12)
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: { // The year of the budget
    type: Number,
    required: true,
  },
  // Ensures that a user can only have one budget per category per month/year
  uniqueIndex: { type: String, unique: true }, // Created dynamically
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save hook to create a unique index string
BudgetSchema.pre('save', function(next) {
  this.uniqueIndex = `${this.user.toString()}-${this.category.toLowerCase()}-${this.month}-${this.year}`;
  next();
});

// You might also want to add an index for faster lookups
BudgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });


module.exports = mongoose.model('Budget', BudgetSchema);