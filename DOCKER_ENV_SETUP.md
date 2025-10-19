# 🐳 Docker Environment Variables Setup Guide

## 📋 Quick Start

### 1️⃣ Create Your Environment File

Copy the example file to create your `.env`:

```bash
# PowerShell
Copy-Item .env.example .env

# Or manually
cp .env.example .env
```

### 2️⃣ Edit the `.env` File

Open `.env` and fill in your actual values:

```bash
# PowerShell
notepad .env

# Or use VS Code
code .env
```

### 3️⃣ Start Docker Compose

```bash
docker-compose up -d
```

That's it! Docker will automatically use the variables from your `.env` file.

---

## 🔑 Required Environment Variables

### Must Configure Before Starting:

| Variable | Where to Get | Example |
|----------|--------------|---------|
| `JWT_SECRET` | Generate random string | `openssl rand -base64 32` |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys | `sk-proj-...` |
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/test/apikeys | `sk_test_...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | https://dashboard.stripe.com/test/apikeys | `pk_test_...` |

### Configure After Creating Stripe Products:

| Variable | Where to Get |
|----------|--------------|
| `BASIC_PLAN_PRICE_ID` | Stripe Dashboard → Products |
| `PRO_PLAN_PRICE_ID` | Stripe Dashboard → Products |

### Configure After Setting Up Webhook:

| Variable | Where to Get |
|----------|--------------|
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks |

---

## 📝 Detailed Setup Instructions

### Step 1: Generate JWT Secret

**Option A: Using OpenSSL (PowerShell)**
```powershell
# Generate a secure random string
$bytes = New-Object Byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Option B: Online Generator**
Visit: https://randomkeygen.com/ → Copy a "Fort Knox Password"

**Option C: Simple Random String**
```
your_super_secret_jwt_key_change_this_to_something_random_1234567890
```

### Step 2: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Paste into `.env` as `OPENAI_API_KEY`

### Step 3: Get Stripe Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** → Put in `VITE_STRIPE_PUBLISHABLE_KEY`
3. Click "Reveal test key" for **Secret key** → Put in `STRIPE_SECRET_KEY`

### Step 4: Create Stripe Products

1. Go to https://dashboard.stripe.com/test/products
2. Click "+ Create product"

**Create Basic Plan:**
- Name: `Basic Plan`
- Price: `$9.99`
- Billing period: `Monthly`
- Click "Save product"
- **Copy the Price ID** (starts with `price_`) → Put in `BASIC_PLAN_PRICE_ID`

**Create Pro Plan:**
- Name: `Pro Plan`
- Price: `$19.99`
- Billing period: `Monthly`
- Click "Save product"
- **Copy the Price ID** → Put in `PRO_PLAN_PRICE_ID`

### Step 5: Setup Stripe Webhook

**For Development (Local Testing):**

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run in a terminal:
```bash
stripe listen --forward-to http://localhost:3001/api/webhook/stripe
```
3. Copy the webhook signing secret (starts with `whsec_`)
4. Put in `.env` as `STRIPE_WEBHOOK_SECRET`

**For Production:**

1. Go to https://dashboard.stripe.com/webhooks
2. Click "+ Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/webhook/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the signing secret → Put in `.env`

---

## 🎯 Environment Variable Reference

### Database Variables

```env
DB_ROOT_PASSWORD=rootpassword      # Root password for MariaDB
DB_NAME=fursona_db                 # Database name
DB_USER=fursonauser                # Database user
DB_PASSWORD=fursonapass            # Database password
DB_PORT=3306                       # External port (default: 3306)
```

### Backend Variables

```env
NODE_ENV=production                # Environment (development/production)
BACKEND_PORT=3001                  # External port for backend API
JWT_SECRET=your_secret_here        # Secret for JWT token signing
```

### Stripe Variables

```env
STRIPE_SECRET_KEY=sk_test_...               # Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...             # Webhook signing secret
BASIC_PLAN_PRICE_ID=price_...               # Basic plan price ID
PRO_PLAN_PRICE_ID=price_...                 # Pro plan price ID
```

### AI/LLM Variables

```env
OPENAI_API_KEY=sk-...              # OpenAI API key
LLM_PROVIDER=openai                # AI provider (openai/anthropic/google)
```

### Frontend Variables

```env
FRONTEND_PORT=3000                          # External port for frontend
FRONTEND_URL=http://localhost:3000          # Frontend URL (for redirects)
VITE_API_URL=http://localhost:3001/api      # Backend API URL
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...     # Stripe publishable key
```

### CORS Variables

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 🚀 Docker Commands

### Start Everything
```bash
docker-compose up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mariadb
```

### Stop Everything
```bash
docker-compose down
```

### Rebuild After Changing .env
```bash
docker-compose down
docker-compose up -d --build
```

### Reset Everything (⚠️ Deletes Database)
```bash
docker-compose down -v
docker-compose up -d --build
```

---

## 🔍 Verify Your Setup

### 1. Check if containers are running:
```bash
docker-compose ps
```

You should see all 3 services as "Up":
- fursona-db (mariadb)
- fursona-backend
- fursona-frontend

### 2. Check backend health:
```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### 3. Access the app:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Database: localhost:3306

---

## ⚙️ Advanced Configuration

### Change Ports

Edit `.env`:
```env
FRONTEND_PORT=8080      # Frontend will be on http://localhost:8080
BACKEND_PORT=4000       # Backend will be on http://localhost:4000
DB_PORT=3307            # Database will be on localhost:3307
```

Then update the API URL:
```env
VITE_API_URL=http://localhost:4000/api
FRONTEND_URL=http://localhost:8080
```

### Use Different Database Credentials

Edit `.env`:
```env
DB_NAME=my_custom_db
DB_USER=myuser
DB_PASSWORD=my_secure_password
```

### Switch to Production Mode

Edit `.env`:
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com/api
ALLOWED_ORIGINS=https://yourdomain.com
```

Use production Stripe keys:
```env
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 🐛 Troubleshooting

### Problem: Backend can't connect to database

**Solution:** Make sure MariaDB is healthy:
```bash
docker-compose logs mariadb
```

Wait a few seconds for database initialization.

### Problem: Environment variables not updating

**Solution:** Rebuild containers:
```bash
docker-compose down
docker-compose up -d --build
```

### Problem: Frontend can't reach backend

**Solution:** Check `VITE_API_URL` in `.env` matches backend port:
```env
VITE_API_URL=http://localhost:3001/api
```

### Problem: Stripe webhooks not working

**Solution:** For local development, use Stripe CLI:
```bash
stripe listen --forward-to http://localhost:3001/api/webhook/stripe
```

---

## 📦 What Gets Created

When you run `docker-compose up`:

1. **MariaDB Container**
   - Internal: Port 3306
   - External: `DB_PORT` (default 3306)
   - Data persists in Docker volume `mariadb_data`

2. **Backend Container**
   - Internal: Port 3001
   - External: `BACKEND_PORT` (default 3001)
   - Uploads stored in `./backend/uploads`

3. **Frontend Container**
   - Internal: Port 80 (nginx)
   - External: `FRONTEND_PORT` (default 3000)
   - Serves static built React app

4. **Network**
   - All containers communicate via `fursona-network`

---

## ✅ Checklist

Before running `docker-compose up`:

- [ ] Copied `.env.example` to `.env`
- [ ] Set `JWT_SECRET` to a random string
- [ ] Added `OPENAI_API_KEY`
- [ ] Added `STRIPE_SECRET_KEY`
- [ ] Added `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Created Stripe products and added price IDs
- [ ] (Optional) Setup Stripe webhook and added secret
- [ ] Saved `.env` file

---

## 🎉 You're Ready!

Run:
```bash
docker-compose up -d
```

Then visit: **http://localhost:3000**

Enjoy! 🚀
