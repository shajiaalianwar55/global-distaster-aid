const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all verified recipients
router.get('/verified', async (req, res) => {
  try {
    const recipients = await User.find({
      verified: true,
      verificationStatus: 'verified',
    })
      .select('userId walletAddress verified verificationBadgeTokenId totalDonationsReceived zoneType')
      .sort({ totalDonationsReceived: -1 })
      .limit(100);

    res.json(recipients);
  } catch (error) {
    console.error('Error fetching verified recipients:', error);
    res.status(500).json({ error: 'Failed to fetch verified recipients' });
  }
});

module.exports = router;

