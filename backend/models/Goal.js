// backend/models/Goal.js
const mongoose = require('mongoose');

const GoalSchema = mongoose.Schema({
  user: { // Link to the User who owns this goal
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: { // Name of the goal (e.g., "New Laptop", "Trip to Goa")
    type: String,
    required: true,
    trim: true,
  },
  targetAmount: { // The total amount user wants to save
    type: Number,
    required: true,
    min: 0,
  },
  currentAmount: { // How much is currently saved towards the goal
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  targetDate: { // Optional date by which the goal should be achieved
    type: Date,
    required: false,
  },
  isCompleted: { // Whether the goal has been completed
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Goal', GoalSchema);