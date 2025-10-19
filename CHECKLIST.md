# ✅ Startup Checklist

Use this checklist to ensure everything is set up correctly.

## 📋 Pre-Flight Checklist

### 1. ✅ Install Required Software

- [ ] Node.js (v18 or higher)
- [ ] Docker Desktop (if using Docker)
- [ ] Git
- [ ] Code editor (VS Code recommended)

### 2. ✅ Get API Keys

- [ ] OpenAI API key from https://platform.openai.com/api-keys
- [ ] Stripe account at https://stripe.com
- [ ] Stripe Test API keys from https://dashboard.stripe.com/test/apikeys
- [ ] Stripe CLI installed (for webhooks): https://stripe.com/docs/stripe-cli

### 3. ✅ Backend Configuration

- [ ] Navigate to `backend/` folder
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- [ ] Add `JWT_SECRET` (generate random string: https://randomkeygen.com/)
- [ ] Add `OPENAI_API_KEY`
- [ ] Add `STRIPE_SECRET_KEY` (starts with `sk_test_`)
- [ ] Run `npm install`

### 4. ✅ Frontend Configuration

- [ ] Navigate to `frontend/` folder
- [ ] Copy `.env.example` to `.env`
- [ ] Set `VITE_API_URL=http://localhost:3001/api`
- [ ] Add `VITE_STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`)
- [ ] Run `npm install`

### 5. ✅ Database Setup

**Option A: Local MariaDB**
- [ ] Install MariaDB locally
- [ ] Start MariaDB service
- [ ] Run migrations: `cd backend && npm run migrate`

**Option B: Docker**
- [ ] Ensure Docker Desktop is running
- [ ] Run `docker-compose up mariadb -d`
- [ ] Wait 10 seconds for DB to initialize
- [ ] Run migrations: `cd backend && npm run migrate`

### 6. ✅ Stripe Product Setup

- [ ] Go to https://dashboard.stripe.com/test/products
- [ ] Click "+ Create product"
- [ ] Create "Basic Plan":
  - Name: "Basic Plan"
  - Price: $9.99/month
  - Recurring: Monthly
  - Copy the Price ID (starts with `price_`)
  - Add to backend `.env` as `BASIC_PLAN_PRICE_ID`
- [ ] Create "Pro Plan":
  - Name: "Pro Plan"
  - Price: $19.99/month
  - Recurring: Monthly
  - Copy the Price ID
  - Add to backend `.env` as `PRO_PLAN_PRICE_ID`

### 7. ✅ Stripe Webhook Setup

**For Local Development:**
- [ ] Open new terminal
- [ ] Run: `stripe login`
- [ ] Run: `stripe listen --forward-to localhost:3001/api/webhook/stripe`
- [ ] Copy the webhook signing secret (starts with `whsec_`)
- [ ] Add to backend `.env` as `STRIPE_WEBHOOK_SECRET`
- [ ] Keep this terminal running

**For Production:**
- [ ] Add webhook endpoint in Stripe Dashboard
- [ ] URL: `https://your-domain.com/api/webhook/stripe`
- [ ] Select events: checkout.session.completed, customer.subscription.*
- [ ] Copy signing secret to `.env`

### 8. ✅ Start the Application

**Option A: Local Development**
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Stripe Webhooks
stripe listen --forward-to localhost:3001/api/webhook/stripe
```

**Option B: Docker**
```powershell
docker-compose up --build
```

### 9. ✅ Verify Everything Works

- [ ] Frontend loads at http://localhost:5173 (or :3000 for Docker)
- [ ] Backend health check: http://localhost:3001/health
- [ ] Database connection works (check backend logs)
- [ ] Register a new account
- [ ] Login successfully
- [ ] Upload test image
- [ ] Generate fursona (uses 1 of 5 free generations)
- [ ] View subscription page
- [ ] Test payment with card: 4242 4242 4242 4242

### 10. ✅ Test Payment Flow

- [ ] Click "Subscribe" on Basic or Pro plan
- [ ] Redirected to Stripe Checkout
- [ ] Use test card: 4242 4242 4242 4242
- [ ] Any future expiry date (e.g., 12/25)
- [ ] Any 3-digit CVC (e.g., 123)
- [ ] Complete payment
- [ ] Redirected back to app
- [ ] Subscription updated (check dashboard)
- [ ] Generation limit increased
- [ ] Webhook received (check Stripe CLI terminal)

## 🚨 Troubleshooting

### Backend won't start
```powershell
# Check if port 3001 is in use
netstat -ano | findstr :3001
# Kill the process if needed
```

### Database connection fails
```powershell
# Check if MariaDB is running
docker-compose ps
# Or check local MariaDB service
Get-Service -Name "MariaDB*"
```

### Frontend can't reach backend
- Verify `VITE_API_URL` in frontend `.env`
- Check backend is running on port 3001
- Check CORS settings in backend `.env`

### Stripe webhook not working
- Ensure Stripe CLI is running
- Check webhook secret matches
- Verify endpoint is `/api/webhook/stripe` (not `/webhook/stripe`)

### OpenAI API errors
- Verify API key is correct and active
- Check you have credits in your OpenAI account
- Ensure model name is correct (gpt-4-vision-preview)

## 🎉 Success Criteria

You're ready to go when:
- ✅ You can register and login
- ✅ You can upload images
- ✅ AI generates fursona descriptions
- ✅ Generation counter decreases
- ✅ You can view subscription plans
- ✅ Test payment completes successfully
- ✅ Subscription upgrades correctly
- ✅ Generation limit increases after upgrade

## 📞 Need Help?

1. Check the main README.md
2. Check SETUP.md
3. Check PROJECT_STRUCTURE.md
4. Look at backend/frontend logs for errors
5. Verify all environment variables are set
6. Make sure all services are running

---

**Quick Test Command:**
```powershell
# Test backend health
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2025-10-18T..."}
```

Happy coding! 🎨🦊
