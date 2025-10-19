import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const checkSubscriptionLimit = async (req, res, next) => {
  try {
    const db = (await import('../db/database.js')).default;
    const [subscriptions] = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = ?',
      [req.user.id]
    );

    if (subscriptions.length === 0) {
      return res.status(403).json({ error: 'No subscription found' });
    }

    const subscription = subscriptions[0];

    // Check if user has reached their generation limit
    if (subscription.generations_used >= subscription.generations_limit) {
      return res.status(403).json({ 
        error: 'Generation limit reached',
        limit: subscription.generations_limit,
        used: subscription.generations_used,
        plan: subscription.plan_type
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
};
