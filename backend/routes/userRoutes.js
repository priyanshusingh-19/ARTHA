// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile, updateUserProfile } = require('../controllers/userController'); // NEW: Import new functions
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

// Authentication routes (unchanged)
router.post('/register', registerUser);
router.post('/login', authUser);

// Profile routes (protected)
router.route('/profile')
  .get(protect, getUserProfile)      // Get user profile
  .put(protect, updateUserProfile);  // Update user profile

module.exports = router;