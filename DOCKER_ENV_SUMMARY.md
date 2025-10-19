# 🐳 Docker Environment Variables - Complete!

## ✨ What Changed

Your Docker setup now uses a **single `.env` file** at the root level to configure everything!

## 📁 New Structure

```
codered-astra/
├── .env.example          ← Template with all variables
├── .env                  ← Your actual values (git-ignored)
├── docker-compose.yml    ← Updated to use .env variables
└── DOCKER_ENV_SETUP.md   ← Complete setup guide
```

## 🎯 How It Works

### Before (Complex):
```
backend/.env          ← Backend variables
frontend/.env         ← Frontend variables
docker-compose.yml    ← Hardcoded values
```

### After (Simple):
```
.env                  ← ALL variables in one place!
docker-compose.yml    ← Uses ${VARIABLE_NAME} references
```

## 🚀 Quick Start

1. **Copy the example:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your values:**
   ```env
   JWT_SECRET=your_random_secret
   OPENAI_API_KEY=sk-...
   STRIPE_SECRET_KEY=sk_test_...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   BASIC_PLAN_PRICE_ID=price_...
   PRO_PLAN_PRICE_ID=price_...
   ```

3. **Start Docker:**
   ```bash
   docker-compose up -d
   ```

That's it! 🎉

## 🔑 Required Variables

| Category | Variable | Required |
|----------|----------|----------|
| **Database** | `DB_ROOT_PASSWORD` | ✅ |
| | `DB_USER` | ✅ |
| | `DB_PASSWORD` | ✅ |
| **Backend** | `JWT_SECRET` | ✅ |
| | `OPENAI_API_KEY` | ✅ |
| | `STRIPE_SECRET_KEY` | ✅ |
| | `STRIPE_WEBHOOK_SECRET` | ⚠️ Optional for testing |
| | `BASIC_PLAN_PRICE_ID` | ✅ |
| | `PRO_PLAN_PRICE_ID` | ✅ |
| **Frontend** | `VITE_API_URL` | ✅ |
| | `VITE_STRIPE_PUBLISHABLE_KEY` | ✅ |

## 📝 Key Features

### 1. Default Values
All variables have sensible defaults:
```yaml
DB_PORT: ${DB_PORT:-3306}     # Uses 3306 if not set
NODE_ENV: ${NODE_ENV:-production}
```

### 2. Build-Time Variables
Frontend variables are passed at build time:
```yaml
build:
  args:
    - VITE_API_URL=${VITE_API_URL}
    - VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}
```

### 3. Runtime Variables
Backend variables are set at runtime:
```yaml
environment:
  - JWT_SECRET=${JWT_SECRET}
  - OPENAI_API_KEY=${OPENAI_API_KEY}
```

## 🎨 Customization Examples

### Change Ports
```env
FRONTEND_PORT=8080
BACKEND_PORT=4000
DB_PORT=3307
```

### Use Different Database
```env
DB_NAME=my_app_db
DB_USER=myuser
DB_PASSWORD=supersecure123
```

### Switch to Production
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com/api
STRIPE_SECRET_KEY=sk_live_...
```

## 🔒 Security

✅ `.env` is in `.gitignore` - Never committed  
✅ `.env.example` shows structure - Safe to commit  
✅ Secrets only in local `.env` file  
✅ Docker containers use environment variable injection  

## 📖 Documentation

- **[DOCKER_ENV_SETUP.md](DOCKER_ENV_SETUP.md)** - Complete setup guide with all details
- **[.env.example](.env.example)** - All available variables with descriptions

## 🎯 Benefits

1. **Single Source of Truth** - All config in one place
2. **Easy Deployment** - Just copy `.env` to new server
3. **No Hardcoding** - All values configurable
4. **Secure** - Secrets never in version control
5. **Flexible** - Easy to change ports, URLs, etc.
6. **Team Friendly** - Everyone uses same structure

## 🚀 Commands

```bash
# Start with your .env
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild after changing .env
docker-compose down
docker-compose up -d --build

# Stop everything
docker-compose down

# Reset (⚠️ deletes database)
docker-compose down -v
```

## ✅ Checklist

Before starting:
- [ ] Copied `.env.example` to `.env`
- [ ] Set `JWT_SECRET`
- [ ] Set `OPENAI_API_KEY`
- [ ] Set `STRIPE_SECRET_KEY`
- [ ] Set `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Created Stripe products (Basic & Pro)
- [ ] Set `BASIC_PLAN_PRICE_ID`
- [ ] Set `PRO_PLAN_PRICE_ID`
- [ ] Saved `.env` file

Then:
```bash
docker-compose up -d
```

## 🎉 Done!

Your Docker environment is now fully configurable with a single `.env` file!

Visit: **http://localhost:3000**

For detailed instructions, see [DOCKER_ENV_SETUP.md](DOCKER_ENV_SETUP.md) 📖
