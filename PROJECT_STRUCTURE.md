# 📂 Complete Project Structure

```
codered-astra/
│
├── 📄 README.md                      # Main documentation
├── 📄 SETUP.md                       # Quick setup guide
├── 📄 docker-compose.yml             # Docker orchestration
├── 📄 .gitignore                     # Git ignore rules
│
├── 📁 frontend/                      # React Frontend
│   ├── 📄 package.json               # Frontend dependencies
│   ├── 📄 vite.config.js             # Vite configuration
│   ├── 📄 Dockerfile                 # Frontend Docker image
│   ├── 📄 nginx.conf                 # Nginx config for production
│   ├── 📄 .env.example               # Environment template
│   ├── 📄 .gitignore
│   │
│   ├── 📁 src/
│   │   ├── 📄 main.jsx               # App entry point
│   │   ├── 📄 App.jsx                # Main app component
│   │   ├── 📄 App.css                # App styles
│   │   ├── 📄 index.css              # Global styles
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── 📄 Auth.jsx           # Login/Register UI
│   │   │   ├── 📄 Auth.css
│   │   │   ├── 📄 Subscription.jsx   # Plans & billing UI
│   │   │   └── 📄 Subscription.css
│   │   │
│   │   ├── 📁 context/
│   │   │   └── 📄 AuthContext.jsx    # Auth state management
│   │   │
│   │   └── 📁 services/
│   │       └── 📄 api.js             # API client service
│   │
│   └── 📁 public/
│       └── 📄 vite.svg
│
└── 📁 backend/                       # Node.js Backend
    ├── 📄 package.json               # Backend dependencies
    ├── 📄 Dockerfile                 # Backend Docker image
    ├── 📄 .env.example               # Environment template
    ├── 📄 .gitignore
    ├── 📄 README.md                  # Backend docs
    │
    ├── 📁 src/
    │   ├── 📄 server.js              # Express server setup
    │   │
    │   ├── 📁 db/
    │   │   ├── 📄 database.js        # MySQL connection pool
    │   │   └── 📄 migrate.js         # Database migrations
    │   │
    │   ├── 📁 middleware/
    │   │   └── 📄 auth.js            # JWT & subscription checks
    │   │
    │   └── 📁 routes/
    │       ├── 📄 auth.js            # /api/auth/* endpoints
    │       ├── 📄 fursona.js         # /api/fursona/* endpoints
    │       ├── 📄 subscription.js    # /api/subscription/* endpoints
    │       └── 📄 webhook.js         # /api/webhook/* endpoints
    │
    └── 📁 uploads/
        └── 📄 .gitkeep               # Upload directory
```

## 🗄️ Database Schema

### Tables Created by Migrations:

**users**
- Authentication and user info

**subscriptions**
- Plan type, usage limits, Stripe IDs

**fursonas**
- Generated fursona descriptions

**payment_history**
- Payment tracking and receipts

## 🔑 Key Files

### Configuration Files
- `docker-compose.yml` - Orchestrates all services (DB, Backend, Frontend)
- `.env` files - Store secrets and configuration (not in git)
- `Dockerfile`s - Define how to build Docker images

### Frontend Entry Points
- `main.jsx` - React app initialization with AuthProvider
- `App.jsx` - Main app logic and routing
- `AuthContext.jsx` - Global auth state

### Backend Entry Points
- `server.js` - Express server and route mounting
- `migrate.js` - Database schema setup
- `routes/*.js` - API endpoint handlers

## 🎯 Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | React 19 + Vite |
| Frontend State | Context API |
| Backend Framework | Node.js + Express |
| Database | MariaDB 11 |
| Authentication | JWT |
| Payments | Stripe |
| AI API | OpenAI GPT-4 Vision |
| Containerization | Docker + Docker Compose |
| Web Server (Prod) | Nginx |

## 🔄 Data Flow

1. **User uploads image** → Frontend (React)
2. **Image sent as base64** → Backend API
3. **Auth middleware checks JWT** → Validates user
4. **Subscription middleware** → Checks usage limits
5. **Image sent to OpenAI** → GPT-4 Vision generates description
6. **Result saved to DB** → MariaDB
7. **Response sent back** → Frontend displays result
8. **Usage counter updated** → Database

## 💳 Payment Flow

1. **User clicks Subscribe** → Frontend
2. **Create checkout session** → Backend API
3. **Redirect to Stripe Checkout** → Stripe hosted page
4. **User completes payment** → Stripe
5. **Webhook notification** → Backend `/api/webhook/stripe`
6. **Update subscription** → Database
7. **User redirected back** → Frontend

## 🚀 Deployment Options

### Development
```bash
# Frontend: http://localhost:5173
npm run dev (in frontend/)

# Backend: http://localhost:3001
npm run dev (in backend/)
```

### Production (Docker)
```bash
# All services together
docker-compose up -d

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Database: localhost:3306
```

## 📊 Port Mapping

| Service | Port | URL |
|---------|------|-----|
| Frontend (Dev) | 5173 | http://localhost:5173 |
| Frontend (Docker) | 3000 | http://localhost:3000 |
| Backend | 3001 | http://localhost:3001 |
| MariaDB | 3306 | localhost:3306 |

## 🔐 Environment Variables

### Backend (13 variables)
- Database connection (5)
- JWT secret (1)
- Stripe keys (2)
- OpenAI key (1)
- CORS origins (1)
- Plan price IDs (2)
- Frontend URL (1)

### Frontend (2 variables)
- API URL
- Stripe publishable key

## 📝 Next Steps After Setup

1. ✅ Configure all environment variables
2. ✅ Get API keys (OpenAI, Stripe)
3. ✅ Create Stripe products
4. ✅ Run database migrations
5. ✅ Start services
6. ✅ Register test account
7. ✅ Test image upload
8. ✅ Test subscription upgrade
9. ✅ Configure webhooks
10. ✅ Deploy to production
