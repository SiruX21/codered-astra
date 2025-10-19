import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Subscription() {
  const { subscription, refreshSubscription } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stripeEnabled, setStripeEnabled] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await api.getPlans();
      setPlans(data.plans);
      setStripeEnabled(data.stripeEnabled !== false);
    } catch (err) {
      setError('Failed to load plans');
    }
  };

  const handleSubscribe = async (plan) => {
    if (plan.id === 'free') return;

    if (!stripeEnabled) {
      setError('Paid subscriptions are not available. Stripe is not configured.');
      return;
    }

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
    if (!stripeEnabled) {
      setError('Subscription management is not available. Stripe is not configured.');
      return;
    }

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-4">
          Choose Your Plan 🎨
        </h1>
        <p className="text-xl text-gray-600">Select the perfect plan for your fursona creation needs</p>
        
        {subscription && (
          <div className="mt-8 bg-primary-50 rounded-[15px] p-6 flex justify-between items-center flex-wrap gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-full font-bold uppercase text-sm">
                {subscription.plan_type}
              </span>
              <span className="text-gray-700 text-lg">
                {subscription.generations_used} / {subscription.generations_limit === 999999 ? '∞' : subscription.generations_limit} generations used
              </span>
            </div>
            {subscription.plan_type !== 'free' && (
              <button 
                onClick={handleManageSubscription}
                className="px-6 py-3 border-2 border-primary-500 text-primary-500 rounded-lg font-bold hover:bg-primary-500 hover:text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Manage Subscription
              </button>
            )}
          </div>
        )}
      </div>

      {!stripeEnabled && (
        <div className="bg-blue-500 text-white px-6 py-4 rounded-lg text-center mb-8 max-w-2xl mx-auto">
          ℹ️ Paid subscriptions are not available. Only the free tier is active.
        </div>
      )}

      {error && (
        <div className="bg-red-500 text-white px-6 py-4 rounded-lg text-center mb-8 animate-shake max-w-2xl mx-auto">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`bg-white border-2 rounded-[20px] p-8 flex flex-col transition-all hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden ${
              subscription?.plan_type === plan.id 
                ? 'border-green-500 bg-green-50' 
                : plan.id === 'pro'
                ? 'border-primary-500 shadow-lg'
                : 'border-gray-200'
            }`}
          >
            {plan.id === 'pro' && (
              <div className="absolute top-4 -right-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-12 py-1 rotate-45 text-xs font-bold">
                Most Popular
              </div>
            )}
            
            <h2 className="text-3xl font-bold mb-4 text-gray-800">{plan.name}</h2>
            <div className="mb-4">
              <span className="text-5xl font-bold text-primary-500">${plan.price}</span>
              <span className="text-xl text-gray-500">/month</span>
            </div>

            <div className="text-lg text-gray-600 mb-6 pb-6 border-b border-gray-200">
              {plan.generations === -1 ? 'Unlimited' : plan.generations} generations
            </div>

            <ul className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading || subscription?.plan_type === plan.id || plan.id === 'free' || (!stripeEnabled && plan.id !== 'free')}
              className={`w-full py-4 text-lg font-bold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                subscription?.plan_type === plan.id
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:-translate-y-0.5 hover:shadow-xl'
              }`}
            >
              {loading ? 'Processing...' : 
               subscription?.plan_type === plan.id ? 'Current Plan' :
               plan.id === 'free' ? 'Free Forever' : 
               !stripeEnabled ? 'Not Available' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
