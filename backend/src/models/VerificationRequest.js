const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  // We don't store exact coordinates for privacy
  // Instead, we store the verification result
  verified: {
    type: Boolean,
    default: false,
  },
  zoneType: {
    type: String,
    enum: ['disaster', 'war'],
  },
  requiresReview: {
    type: Boolean,
    default: false,
  },
  reviewStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: {
    type: String,
  },
  reviewedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);

