import express from 'express';
import Stripe from 'stripe';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get subscription plans
router.get('/plans', async (req, res) => {
  res.json({
    plans: [
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
      },
      {
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
      },
      {
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
      }
    ]
  });
});

// Create checkout session
router.post('/create-checkout', authenticateToken, async (req, res) => {
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
