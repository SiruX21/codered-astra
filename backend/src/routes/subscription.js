import express from 'express';
import Stripe from 'stripe';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Check if Stripe is configured
const isStripeEnabled = !!(
  process.env.STRIPE_SECRET_KEY && 
  process.env.STRIPE_WEBHOOK_SECRET &&
  process.env.BASIC_PLAN_PRICE_ID &&
  process.env.PRO_PLAN_PRICE_ID
);

const stripe = isStripeEnabled ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

if (!isStripeEnabled) {
  console.warn('⚠️  Stripe is not configured. Subscription features will be disabled.');
  console.warn('   Only the free tier will be available.');
}

// Get subscription plans
router.get('/plans', async (req, res) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      generations: 5,
      features: [
        '5 fursona generations per month',
        'Basic AI quality',
        'Community support'
      ]
    }
  ];

  // Only include paid plans if Stripe is enabled
  if (isStripeEnabled) {
    plans.push({
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      priceId: process.env.BASIC_PLAN_PRICE_ID,
      generations: 50,
      features: [
        '50 fursona generations per month',
        'Enhanced AI quality',
        'Priority support',
        'Save generation history'
      ]
    });
    plans.push({
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      priceId: process.env.PRO_PLAN_PRICE_ID,
      generations: -1, // unlimited
      features: [
        'Unlimited fursona generations',
        'Best AI quality',
        'Priority support',
        'Save generation history',
        'Early access to new features'
      ]
    });
  }

  res.json({
    plans,
    stripeEnabled: isStripeEnabled
  });
});

// Create checkout session
router.post('/create-checkout', authenticateToken, async (req, res) => {
  if (!isStripeEnabled) {
    return res.status(503).json({ 
      error: 'Stripe is not configured. Paid subscriptions are not available.',
      stripeEnabled: false
    });
  }

  try {
    const { priceId, planType } = req.body;

    // Get or create Stripe customer
    const [users] = await db.query('SELECT email FROM users WHERE id = ?', [req.user.id]);
    const [subscriptions] = await db.query(
      'SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?',
      [req.user.id]
    );

    let customerId = subscriptions[0]?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: users[0].email,
        metadata: { userId: req.user.id.toString() }
      });
      customerId = customer.id;

      await db.query(
        'UPDATE subscriptions SET stripe_customer_id = ? WHERE user_id = ?',
        [customerId, req.user.id]
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/cancel`,
      metadata: {
        userId: req.user.id.toString(),
        planType
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create customer portal session
router.post('/create-portal', authenticateToken, async (req, res) => {
  if (!isStripeEnabled) {
    return res.status(503).json({ 
      error: 'Stripe is not configured. Subscription management is not available.',
      stripeEnabled: false
    });
  }

  try {
    const [subscriptions] = await db.query(
      'SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?',
      [req.user.id]
    );

    if (!subscriptions[0]?.stripe_customer_id) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscriptions[0].stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Get current subscription
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const [subscriptions] = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = ?',
      [req.user.id]
    );

    if (subscriptions.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ subscription: subscriptions[0] });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

export default router;
