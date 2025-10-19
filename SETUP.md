# 🚀 Quick Setup Guide

## For Local Development (Without Docker)

### 1. Install MariaDB Locally

**Windows (with Chocolatey):**
```powershell
choco install mariadb
```

**Or download from:** https://mariadb.org/download/

### 2. Setup Backend

```powershell
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set:
- `DB_HOST=localhost`
- `JWT_SECRET=` (generate a random string)
- `OPENAI_API_KEY=` (your OpenAI API key)
- `STRIPE_SECRET_KEY=` (your Stripe secret key)

Run migrations:
```powershell
npm run migrate
```

Start backend:
```powershell
npm run dev
```

### 3. Setup Frontend

```powershell
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
- `VITE_API_URL=http://localhost:3001/api`
- `VITE_STRIPE_PUBLISHABLE_KEY=` (your Stripe publishable key)

Start frontend:
```powershell
npm run dev
```

Visit: http://localhost:5173

## For Docker Deployment

### 1. Copy environment files

```powershell
cd backend
cp .env.example .env
# Edit .env with your credentials

cd ../frontend
cp .env.example .env
# Edit .env (use http://localhost:3001/api for local Docker)
```

### 2. Start everything

```powershell
cd ..
docker-compose up --build
```

Visit: http://localhost:3000

## Important: Get Your API Keys

1. **OpenAI API Key**
   - Go to: https://platform.openai.com/api-keys
   - Create new secret key
   - Add to backend `.env` as `OPENAI_API_KEY`

2. **Stripe Keys**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy "Publishable key" → frontend `.env` as `VITE_STRIPE_PUBLISHABLE_KEY`
   - Copy "Secret key" → backend `.env` as `STRIPE_SECRET_KEY`

3. **Create Stripe Products**
   - Go to: https://dashboard.stripe.com/test/products
   - Create "Basic Plan" at $9.99/month → Copy Price ID
   - Create "Pro Plan" at $19.99/month → Copy Price ID
   - Add to backend `.env` as `BASIC_PLAN_PRICE_ID` and `PRO_PLAN_PRICE_ID`

4. **Setup Stripe Webhooks**
   - For local development, use Stripe CLI:
   ```powershell
   stripe listen --forward-to localhost:3001/api/webhook/stripe
   ```
   - Copy the webhook signing secret to backend `.env` as `STRIPE_WEBHOOK_SECRET`

## Testing the App

1. **Register a new account**
2. **You'll start with a free plan** (5 generations)
3. **Upload an image** and click Generate
4. **To test payments**, use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Any future expiry, any 3-digit CVC

## Need Help?

Check the main README.md for detailed documentation and troubleshooting.
