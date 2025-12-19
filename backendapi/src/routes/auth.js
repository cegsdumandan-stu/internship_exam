const express = require('express');
const router = express.Router();

// Mock database access (in a real app, import from models)
const { getUsers } = require('../seeders/useSeeders');

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Check for user in "database"
  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(400).json({ message: 'User does not exist' });
  }

  // Validate password (in production, use bcrypt.compare)
  if (password !== user.password) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Create mock token (in production, use jsonwebtoken)
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

module.exports = router;