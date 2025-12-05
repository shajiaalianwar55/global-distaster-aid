const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { walletAddress, email, name } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Check if user already exists
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (user) {
      return res.json({
        userId: user.userId,
        walletAddress: user.walletAddress,
        verified: user.verified,
      });
    }

    // Create new user
    const userId = uuidv4();
    user = new User({
      userId,
      walletAddress: walletAddress.toLowerCase(),
      email,
      name,
    });

    await user.save();

    res.status(201).json({
      userId: user.userId,
      walletAddress: user.walletAddress,
      verified: user.verified,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

module.exports = router;

