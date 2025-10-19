# Stripe Optional Configuration

## Overview
Stripe integration is now **completely optional**. The application will work perfectly fine with just the free tier if Stripe is not configured.

## How It Works

### Backend Changes

#### 1. **`backend/src/routes/subscription.js`**
- Added `isStripeEnabled` check that validates all required Stripe environment variables
- Stripe is only initialized if all required variables are present:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `BASIC_PLAN_PRICE_ID`
  - `PRO_PLAN_PRICE_ID`
- `/plans` endpoint only returns paid plans if Stripe is enabled
- `/create-checkout` and `/create-portal` endpoints return 503 error if Stripe is not configured
- Warning message logged on startup if Stripe is disabled

#### 2. **`backend/src/routes/webhook.js`**
- Added `isStripeEnabled` check
- Webhook endpoint returns 503 if Stripe is not configured
- Prevents errors if webhook is accidentally called

### Frontend Changes

#### 3. **`frontend/src/components/Subscription.jsx`**
- Added `stripeEnabled` state from API response
- Shows informational notice when Stripe is disabled
- Disables paid plan subscription buttons when Stripe is not available
- Prevents portal session creation when Stripe is disabled
- Shows "Not Available" on paid plan buttons when Stripe is off

### Environment Configuration

#### 4. **`.env` file**
- Added clear comments indicating Stripe is optional
- All Stripe variables can be left with placeholder values
- Application will detect missing/invalid keys and disable Stripe features

## Usage

### Running Without Stripe (Free Tier Only)
Simply leave the Stripe environment variables with their placeholder values:
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
BASIC_PLAN_PRICE_ID=price_basic_monthly
PRO_PLAN_PRICE_ID=price_pro_monthly
```

The app will:
- ✅ Start normally
- ✅ Show only the free tier plan
- ✅ Allow users to sign up and use 5 generations per month
- ✅ Display a notice that paid plans are not available
- ⚠️ Log a warning: "Stripe is not configured. Subscription features will be disabled."

### Enabling Stripe (Paid Plans)
Fill in real Stripe values from your Stripe Dashboard:
```env
STRIPE_SECRET_KEY=sk_test_51ABC...
STRIPE_WEBHOOK_SECRET=whsec_XYZ...
BASIC_PLAN_PRICE_ID=price_1ABC...
PRO_PLAN_PRICE_ID=price_1XYZ...
```

The app will:
- ✅ Initialize Stripe
- ✅ Show all three plans (Free, Basic, Pro)
- ✅ Allow users to subscribe to paid plans
- ✅ Handle webhooks for subscription events
- ✅ Enable subscription management portal

## Benefits

1. **Easier Development**: Test the app without setting up Stripe
2. **Flexible Deployment**: Deploy without monetization initially
3. **Gradual Rollout**: Add paid features when ready
4. **No Errors**: Application handles missing Stripe gracefully
5. **Clear Feedback**: Users see why paid plans aren't available

## API Response Changes

### `/api/subscription/plans`
Now returns:
```json
{
  "plans": [...],
  "stripeEnabled": true/false
}
```

### Error Responses (when Stripe disabled)
```json
{
  "error": "Stripe is not configured. Paid subscriptions are not available.",
  "stripeEnabled": false
}
```

## Testing

### Without Stripe
1. Leave .env with placeholder values
2. Start the application
3. Visit subscription page
4. Should see only free tier plan
5. Should see blue notice about paid plans being unavailable

### With Stripe
1. Add real Stripe credentials to .env
2. Restart the application
3. Visit subscription page
4. Should see all three plans
5. Should be able to subscribe to paid plans
