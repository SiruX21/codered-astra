# 🎨 Fursona Generator - Full Stack Application

A full-stack web application that uses AI to generate unique fursona descriptions from uploaded images. Built with React, Node.js, MariaDB, and Stripe for payment processing.

## 🚀 Features

- **AI-Powered Generation**: Upload images and get creative fursona descriptions using OpenAI's GPT-4 Vision
- **User Authentication**: Secure registration and login with JWT
- **Subscription Plans**: Free, Basic, and Pro tiers with Stripe integration
- **Usage Tracking**: Monitor generation limits and usage
- **Responsive Design**: Beautiful UI that works on all devices
- **Docker Support**: Easy deployment with Docker Compose

## 📁 Project Structure

```
codered-astra/
├── frontend/           # React + Vite frontend
├── backend/            # Node.js + Express API
├── docker-compose.yml  # Docker orchestration
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Context API for state management

### Backend
- Node.js + Express
- MariaDB (MySQL)
- JWT Authentication
- Stripe Payment Integration
- OpenAI API

### DevOps
- Docker & Docker Compose
- Nginx (for production)

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- Stripe account (for payments)
- OpenAI API key (or other LLM provider)

### 1. Clone the Repository
```bash
git clone https://github.com/SiruX21/codered-astra.git
cd codered-astra
```

### 2. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit with your actual values
# See DOCKER_ENV_SETUP.md for detailed instructions
```

Edit `.env` with your credentials:
- `JWT_SECRET` - Random secure string
- `OPENAI_API_KEY` - Your OpenAI API key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `BASIC_PLAN_PRICE_ID` - Stripe Basic plan price ID
- `PRO_PLAN_PRICE_ID` - Stripe Pro plan price ID

**📖 For detailed setup instructions, see [DOCKER_ENV_SETUP.md](DOCKER_ENV_SETUP.md)**

### 3. Start with Docker
```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:3306

### 5. Run Locally (Development)

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run migrate  # Run database migrations
npm run dev      # Start dev server
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev      # Start dev server at http://localhost:5173
```

## 💳 Stripe Setup

### 1. Create Products in Stripe Dashboard

Create two subscription products:

**Basic Plan** ($9.99/month):
- 50 generations per month
- Copy the Price ID to `BASIC_PLAN_PRICE_ID` in backend `.env`

**Pro Plan** ($19.99/month):
- Unlimited generations
- Copy the Price ID to `PRO_PLAN_PRICE_ID` in backend `.env`

### 2. Configure Webhooks

Add webhook endpoint: `https://your-domain.com/api/webhook/stripe`

Enable these events:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Test with Stripe CLI (Development)
```bash
stripe listen --forward-to localhost:3001/api/webhook/stripe
```

## 📊 Database Schema

### Users
- id, email, password_hash, name, created_at, updated_at

### Subscriptions
- id, user_id, stripe_customer_id, stripe_subscription_id
- plan_type (free/basic/pro), status, generations_used, generations_limit
- current_period_start, current_period_end

### Fursonas
- id, user_id, description, created_at

### Payment History
- id, user_id, stripe_payment_intent_id, amount, status

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DB_HOST=mariadb
DB_PORT=3306
DB_USER=fursonauser
DB_PASSWORD=fursonapass
DB_NAME=fursona_db
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
BASIC_PLAN_PRICE_ID=price_...
PRO_PLAN_PRICE_ID=price_...
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Fursona Generation
- `POST /api/fursona/generate` - Generate fursona (requires auth)
- `GET /api/fursona/history` - Get user's fursonas

### Subscriptions
- `GET /api/subscription/plans` - Get available plans
- `GET /api/subscription/current` - Get user's subscription
- `POST /api/subscription/create-checkout` - Create Stripe checkout
- `POST /api/subscription/create-portal` - Create Stripe portal

### Webhooks
- `POST /api/webhook/stripe` - Stripe webhook handler

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Build and start
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Reset database (WARNING: deletes all data)
docker-compose down -v
```

## 🧪 Testing

### Test Stripe Payments
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Auth: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC.

## 📝 Production Deployment

1. **Update environment variables** for production
2. **Set up SSL/TLS** with Let's Encrypt or similar
3. **Configure domain** for frontend and backend
4. **Update CORS origins** in backend
5. **Set up Stripe webhook** with production endpoint
6. **Enable Stripe live mode**
7. **Configure database backups**
8. **Set up monitoring** (e.g., PM2, Datadog)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check if MariaDB is running
docker-compose ps

# View database logs
docker-compose logs mariadb
```

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend
- Ensure backend is running on correct port

### Stripe Webhook Not Working
- Use Stripe CLI for local testing
- Verify webhook secret is correct
- Check endpoint URL is accessible

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions

---

Built with ❤️ for the furry community
