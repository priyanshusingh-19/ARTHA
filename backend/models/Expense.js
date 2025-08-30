// backend/models/Expense.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Keep this as it's used elsewhere, though not directly by Expense model

const ExpenseSchema = mongoose.Schema({
  user: { // NEW FIELD: Link to User model
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // References the 'User' model
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: false,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

// You can remove the UserSchema.pre('save') and UserSchema.methods.matchPassword
// if this file is *only* for Expense, but it's fine if they remain.
// However, they conceptually belong in User.js, not Expense.js.
// If you already have User.js and it contains these, remove them from here.

module.exports = mongoose.model('Expense', ExpenseSchema);