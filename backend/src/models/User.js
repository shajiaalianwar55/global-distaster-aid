const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  email: {
    type: String,
    sparse: true,
  },
  name: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationBadgeTokenId: {
    type: Number,
  },
  zoneType: {
    type: String,
    enum: ['disaster', 'war'],
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  verificationRequestedAt: {
    type: Date,
  },
  verifiedAt: {
    type: Date,
  },
  totalDonationsReceived: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);

