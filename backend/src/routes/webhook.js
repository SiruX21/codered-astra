import express from 'express';
import Stripe from 'stripe';
import db from '../db/database.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
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

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = parseInt(session.metadata.userId);
        const planType = session.metadata.planType;

        // Update subscription
        const generationsLimit = planType === 'basic' ? 50 : 999999;
        await db.query(
          `UPDATE subscriptions 
           SET stripe_subscription_id = ?, 
               plan_type = ?, 
               status = 'active',
               generations_limit = ?,
               generations_used = 0,
               current_period_start = NOW(),
               current_period_end = DATE_ADD(NOW(), INTERVAL 1 MONTH)
           WHERE user_id = ?`,
          [session.subscription, planType, generationsLimit, userId]
        );

        console.log(`✅ Subscription activated for user ${userId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const [subs] = await db.query(
          'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = ?',
          [subscription.id]
        );

        if (subs.length > 0) {
          await db.query(
            `UPDATE subscriptions 
             SET status = ?,
                 cancel_at_period_end = ?,
                 current_period_end = FROM_UNIXTIME(?)
             WHERE stripe_subscription_id = ?`,
            [
              subscription.status,
              subscription.cancel_at_period_end,
              subscription.current_period_end,
              subscription.id
            ]
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await db.query(
          `UPDATE subscriptions 
           SET plan_type = 'free',
               status = 'active',
               generations_limit = 5,
               generations_used = 0,
               stripe_subscription_id = NULL
           WHERE stripe_subscription_id = ?`,
          [subscription.id]
        );

        console.log(`✅ Subscription cancelled and reverted to free plan`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const [subs] = await db.query(
          'SELECT user_id, plan_type FROM subscriptions WHERE stripe_customer_id = ?',
          [invoice.customer]
        );

        if (subs.length > 0) {
          // Reset generation count for new billing period
          await db.query(
            'UPDATE subscriptions SET generations_used = 0 WHERE stripe_customer_id = ?',
            [invoice.customer]
          );

          // Log payment
          await db.query(
            `INSERT INTO payment_history (user_id, stripe_payment_intent_id, amount, currency, status, description)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              subs[0].user_id,
              invoice.payment_intent,
              invoice.amount_paid,
              invoice.currency,
              'succeeded',
              `${subs[0].plan_type} plan subscription`
            ]
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await db.query(
          `UPDATE subscriptions 
           SET status = 'past_due'
           WHERE stripe_customer_id = ?`,
          [invoice.customer]
        );
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
