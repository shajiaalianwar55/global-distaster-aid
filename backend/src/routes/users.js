const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user.userId,
      walletAddress: user.walletAddress,
      verified: user.verified,
      verificationBadgeTokenId: user.verificationBadgeTokenId,
      totalDonationsReceived: user.totalDonationsReceived,
      zoneType: user.zoneType,
      verificationStatus: user.verificationStatus,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;

