const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const VerificationRequest = require('../models/VerificationRequest');
const verificationService = require('../services/verification');
const { ethers } = require('ethers');

// Verify user location
router.post('/location', async (req, res) => {
  try {
    const { latitude, longitude, userId } = req.body;

    if (!latitude || !longitude || !userId) {
      return res.status(400).json({ error: 'Latitude, longitude, and userId are required' });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Find user
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify location
    const verificationResult = await verificationService.verifyLocation(
      latitude,
      longitude
    );

    // Create verification request record (without storing exact coordinates)
    const requestId = uuidv4();
    const verificationRequest = new VerificationRequest({
      requestId,
      userId,
      walletAddress: user.walletAddress,
      latitude: Math.round(latitude * 100) / 100, // Round to ~1km precision
      longitude: Math.round(longitude * 100) / 100,
      verified: verificationResult.verified,
      zoneType: verificationResult.zoneType,
      requiresReview: verificationResult.requiresReview,
      reviewStatus: verificationResult.requiresReview ? 'pending' : 'approved',
    });

    await verificationRequest.save();

    // If automatically verified, update user
    if (verificationResult.verified && !verificationResult.requiresReview) {
      user.verified = true;
      user.zoneType = verificationResult.zoneType;
      user.verificationStatus = 'verified';
      user.verifiedAt = new Date();
      await user.save();

      // In production, mint verification badge NFT here
      // await mintVerificationBadge(user.walletAddress, verificationResult.zoneType);
    } else {
      // Mark as pending review
      user.verificationStatus = 'pending';
      user.verificationRequestedAt = new Date();
      await user.save();
    }

    res.json({
      verified: verificationResult.verified,
      zoneType: verificationResult.zoneType,
      requiresReview: verificationResult.requiresReview,
      message: verificationResult.message,
    });
  } catch (error) {
    console.error('Location verification error:', error);
    res.status(500).json({ error: 'Failed to verify location' });
  }
});

// Admin endpoint to approve/reject verification requests
router.post('/review', async (req, res) => {
  try {
    const { requestId, approved, reviewedBy } = req.body;

    if (!requestId || approved === undefined) {
      return res.status(400).json({ error: 'Request ID and approval status are required' });
    }

    const verificationRequest = await VerificationRequest.findOne({ requestId });
    if (!verificationRequest) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    verificationRequest.reviewStatus = approved ? 'approved' : 'rejected';
    verificationRequest.reviewedBy = reviewedBy;
    verificationRequest.reviewedAt = new Date();
    verificationRequest.verified = approved;

    await verificationRequest.save();

    // Update user if approved
    if (approved) {
      const user = await User.findOne({ userId: verificationRequest.userId });
      if (user) {
        user.verified = true;
        user.zoneType = verificationRequest.zoneType;
        user.verificationStatus = 'verified';
        user.verifiedAt = new Date();
        await user.save();

        // Mint verification badge NFT
        // await mintVerificationBadge(user.walletAddress, verificationRequest.zoneType);
      }
    }

    res.json({
      success: true,
      verificationRequest,
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: 'Failed to review verification request' });
  }
});

// Get pending verification requests (admin)
router.get('/pending', async (req, res) => {
  try {
    const requests = await VerificationRequest.find({
      reviewStatus: 'pending',
      requiresReview: true,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

module.exports = router;

