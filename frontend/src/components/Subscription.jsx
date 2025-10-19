import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Subscription.css';

export default function Subscription() {
  const { subscription, refreshSubscription } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await api.getPlans();
      setPlans(data.plans);
    } catch (err) {
      setError('Failed to load plans');
    }
  };

  const handleSubscribe = async (plan) => {
    if (plan.id === 'free') return;

    setLoading(true);
    setError('');

    try {
      const { url } = await api.createCheckoutSession(plan.priceId, plan.id);
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { url } = await api.createPortalSession();
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <h1>Choose Your Plan 🎨</h1>
        <p>Select the perfect plan for your fursona creation needs</p>
        
        {subscription && (
          <div className="current-plan">
            <div className="plan-info">
              <span className="plan-badge">{subscription.plan_type}</span>
              <span className="usage-info">
                {subscription.generations_used} / {subscription.generations_limit === 999999 ? '∞' : subscription.generations_limit} generations used
              </span>
            </div>
            {subscription.plan_type !== 'free' && (
              <button 
                onClick={handleManageSubscription}
                className="manage-button"
                disabled={loading}
              >
                Manage Subscription
              </button>
            )}
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="plans-grid">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`plan-card ${subscription?.plan_type === plan.id ? 'current' : ''} ${plan.id === 'pro' ? 'featured' : ''}`}
          >
            {plan.id === 'pro' && <div className="featured-badge">Most Popular</div>}
            
            <h2>{plan.name}</h2>
            <div className="price">
              <span className="amount">${plan.price}</span>
              <span className="period">/month</span>
            </div>

            <div className="generations">
              {plan.generations === -1 ? 'Unlimited' : plan.generations} generations
            </div>

            <ul className="features">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <span className="check">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading || subscription?.plan_type === plan.id || plan.id === 'free'}
              className={`subscribe-button ${subscription?.plan_type === plan.id ? 'current-plan-btn' : ''}`}
            >
              {loading ? 'Processing...' : 
               subscription?.plan_type === plan.id ? 'Current Plan' :
               plan.id === 'free' ? 'Free Forever' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
