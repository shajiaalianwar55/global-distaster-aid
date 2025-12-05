const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Donation = require('../models/Donation');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create fiat donation (Stripe)
router.post('/fiat', async (req, res) => {
  try {
    const { recipientId, amount, currency } = req.body;

    if (!recipientId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Recipient ID and valid amount are required' });
    }

    const recipient = await User.findOne({ userId: recipientId });
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    if (!recipient.verified) {
      return res.status(400).json({ error: 'Recipient must be verified to receive donations' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Disaster Relief Donation',
              description: `Donation to ${recipient.walletAddress}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/donation/cancel`,
      metadata: {
        recipientId,
        recipientAddress: recipient.walletAddress,
      },
    });

    // Create donation record
    const donationId = uuidv4();
    const donation = new Donation({
      donationId,
      donorAddress: 'stripe', // Will be updated when webhook confirms payment
      recipientId,
      recipientAddress: recipient.walletAddress,
      amount,
      currency: 'fiat',
      stripeSessionId: session.id,
      status: 'pending',
    });

    await donation.save();

    res.json({
      sessionId: session.id,
      clientSecret: session.client_secret,
    });
  } catch (error) {
    console.error('Fiat donation error:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

// Stripe webhook handler (for production, use Stripe CLI for local testing)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Update donation status
    const donation = await Donation.findOne({ stripeSessionId: session.id });
    if (donation) {
      donation.status = 'completed';
      donation.donorAddress = session.customer_details?.email || 'anonymous';
      await donation.save();

      // Update recipient's total donations
      const recipient = await User.findOne({ userId: donation.recipientId });
      if (recipient) {
        recipient.totalDonationsReceived += donation.amount;
        await recipient.save();
      }
    }
  }

  res.json({ received: true });
});

// Get donation history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const donations = await Donation.find({
      $or: [{ recipientId: userId }, { donorAddress: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(donations);
  } catch (error) {
    console.error('Error fetching donation history:', error);
    res.status(500).json({ error: 'Failed to fetch donation history' });
  }
});

module.exports = router;

