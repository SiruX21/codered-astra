# Environment Variables Quick Reference

## Required Variables (App won't work without these)

### Database
```env
DB_ROOT_PASSWORD=rootpassword
DB_NAME=fursona_db
DB_USER=fursonauser
DB_PASSWORD=fursonapass
DB_PORT=3306
```

### Backend
```env
NODE_ENV=production
BACKEND_PORT=3001
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

### AI/LLM (Choose one provider)
```env
LLM_PROVIDER=gemini

# For Gemini (recommended):
GEMINI_API_KEY=your_gemini_api_key_here

# For OpenAI (alternative):
OPENAI_API_KEY=sk-your_openai_api_key
```

### Frontend
```env
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:3001/api
```

### CORS
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Optional Variables

### Stripe (for paid subscriptions)
**Note**: If you don't configure these, the app will work fine with only the free tier.

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
BASIC_PLAN_PRICE_ID=price_basic_monthly
PRO_PLAN_PRICE_ID=price_pro_monthly
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

**All of the above must be configured for Stripe to work**. If any are missing or invalid, Stripe features will be automatically disabled.

---

## Quick Start Configurations

### Minimal Setup (No Payments)
This is the minimum to get the app running with free tier only:

1. ✅ Set database credentials
2. ✅ Generate JWT secret: `openssl rand -base64 32`
3. ✅ Get Gemini API key from: https://aistudio.google.com/app/apikey
4. ✅ Leave Stripe variables as placeholders

### Full Setup (With Payments)
To enable paid subscriptions:

1. ✅ Complete minimal setup above
2. ✅ Get Stripe keys from: https://dashboard.stripe.com/test/apikeys
3. ✅ Create products in Stripe Dashboard
4. ✅ Set up webhook endpoint and get webhook secret
5. ✅ Fill in all Stripe environment variables

---

## Validation Checklist

Before starting the app, ensure:

- [ ] Database variables are set
- [ ] JWT_SECRET is a secure random string (not default)
- [ ] Either GEMINI_API_KEY or OPENAI_API_KEY is set
- [ ] LLM_PROVIDER matches your chosen provider
- [ ] FRONTEND_URL and VITE_API_URL match your setup
- [ ] (Optional) All Stripe variables are set if you want paid plans

---

## Environment-Specific Settings

### Development
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001/api
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Production
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com/api
ALLOWED_ORIGINS=https://yourdomain.com
# Use production Stripe keys (pk_live_... and sk_live_...)
```

---

## Getting API Keys

### Gemini (Free tier available)
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and paste into GEMINI_API_KEY

### Stripe (Test mode is free)
1. Visit: https://dashboard.stripe.com/test/apikeys
2. Create account or sign in
3. Copy "Secret key" → STRIPE_SECRET_KEY
4. Copy "Publishable key" → VITE_STRIPE_PUBLISHABLE_KEY
5. Create products for Basic and Pro plans
6. Copy price IDs → BASIC_PLAN_PRICE_ID, PRO_PLAN_PRICE_ID
7. Set up webhook endpoint → get STRIPE_WEBHOOK_SECRET

### OpenAI (Alternative to Gemini)
1. Visit: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy and paste into OPENAI_API_KEY
