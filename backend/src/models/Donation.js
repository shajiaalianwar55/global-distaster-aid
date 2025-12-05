const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donationId: {
    type: String,
    required: true,
    unique: true,
  },
  donorAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  recipientId: {
    type: String,
    required: true,
  },
  recipientAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ['crypto', 'fiat'],
    required: true,
  },
  token: {
    type: String,
    enum: ['ETH', 'USDC'],
  },
  transactionHash: {
    type: String,
  },
  stripeSessionId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Donation', donationSchema);

