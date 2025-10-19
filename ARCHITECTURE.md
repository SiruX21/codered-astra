# 🎨 Fursona Generator - System Architecture

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                    http://localhost:5173                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Vite)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Auth.jsx  │  │   App.jsx    │  │Subscription  │       │
│  │   (Login)   │  │  (Generator) │  │    .jsx      │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │         AuthContext (JWT Token Management)        │      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │         API Service (HTTP Client)                 │      │
│  └──────────────────────────────────────────────────┘      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ REST API (JSON)
                       │ Bearer Token Auth
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              NODE.JS BACKEND (Express)                       │
│                http://localhost:3001/api                     │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │              Middleware Layer                     │      │
│  │  • CORS         • Body Parser                     │      │
│  │  • JWT Auth     • Subscription Limits             │      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth      │  │   Fursona    │  │ Subscription │      │
│  │   Routes    │  │   Routes     │  │   Routes     │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │         Webhook Routes (Stripe Events)            │      │
│  └──────────────────────────────────────────────────┘      │
└───┬──────────────┬──────────────┬────────────────┬──────────┘
    │              │              │                │
    │              │              │                │
    ▼              ▼              ▼                ▼
┌─────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐
│ MariaDB │  │ OpenAI   │  │  Stripe   │  │   Stripe     │
│Database │  │   API    │  │ Checkout  │  │  Webhooks    │
│         │  │          │  │           │  │              │
│ • users │  │ GPT-4    │  │ Payment   │  │ Subscription │
│ • subs  │  │ Vision   │  │ Sessions  │  │   Events     │
│ •furso  │  │          │  │           │  │              │
└─────────┘  └──────────┘  └───────────┘  └──────────────┘
```

## 🔄 User Flow: Image Upload & Generation

```
1. User Uploads Image
   │
   ├─→ [Drag & Drop Zone]
   │   └─→ FileReader converts to base64
   │
   └─→ [Click Browse Button]
       └─→ FileReader converts to base64
   
2. Display Preview
   └─→ Image shown in preview section

3. User Clicks "Generate"
   │
   ├─→ Check if authenticated
   │   └─→ If not → Show login screen
   │
   ├─→ Check subscription limit
   │   └─→ If exceeded → Show upgrade screen
   │
   └─→ Send to Backend API

4. Backend Processing
   │
   ├─→ Verify JWT token
   ├─→ Check subscription limit (DB query)
   ├─→ Send image to OpenAI API
   ├─→ Receive fursona description
   ├─→ Save to database
   ├─→ Increment usage counter
   └─→ Return result to frontend

5. Display Result
   └─→ Show fursona description
   └─→ Update usage counter display
```

## 💳 Payment Flow

```
1. User Views Plans
   └─→ GET /api/subscription/plans

2. User Clicks "Subscribe"
   │
   └─→ POST /api/subscription/create-checkout
       ├─→ Backend creates Stripe Customer
       ├─→ Backend creates Checkout Session
       └─→ Returns checkout URL

3. Redirect to Stripe
   └─→ User completes payment on Stripe-hosted page

4. Stripe Processes Payment
   │
   ├─→ Payment successful
   │   └─→ Stripe sends webhook to backend
   │       └─→ POST /api/webhook/stripe
   │
   └─→ Backend receives "checkout.session.completed"
       ├─→ Verify webhook signature
       ├─→ Update subscription in database
       │   ├─→ Set plan_type = 'basic' or 'pro'
       │   ├─→ Set generations_limit
       │   ├─→ Reset generations_used to 0
       │   └─→ Save Stripe subscription_id
       └─→ Log payment in payment_history

5. Redirect Back to App
   └─→ User sees updated subscription
```

## 🔐 Authentication Flow

```
┌─────────────┐
│   Register  │
└──────┬──────┘
       │
       ├─→ POST /api/auth/register
       │   ├─→ Validate email/password
       │   ├─→ Hash password (bcrypt)
       │   ├─→ Insert user in database
       │   ├─→ Create free subscription
       │   └─→ Generate JWT token
       │
       └─→ Frontend stores token in localStorage
           └─→ AuthContext updates state

┌─────────────┐
│    Login    │
└──────┬──────┘
       │
       ├─→ POST /api/auth/login
       │   ├─→ Find user by email
       │   ├─→ Verify password
       │   └─→ Generate JWT token
       │
       └─→ Frontend stores token
           └─→ AuthContext updates state

┌─────────────┐
│Authenticated│
│  Requests   │
└──────┬──────┘
       │
       └─→ All API calls include:
           Header: Authorization: Bearer <token>
           
           Backend middleware verifies:
           ├─→ Token is valid
           ├─→ Token not expired
           └─→ Extract user ID from token
```

## 🗄️ Database Schema Relationships

```
┌──────────────────┐
│      users       │
│──────────────────│
│ id (PK)          │◄────┐
│ email            │     │
│ password_hash    │     │
│ name             │     │
│ created_at       │     │
└──────────────────┘     │
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         │               │               │
┌────────▼───────┐ ┌────▼─────────┐ ┌───▼──────────────┐
│ subscriptions  │ │   fursonas   │ │ payment_history  │
│────────────────│ │──────────────│ │──────────────────│
│ id (PK)        │ │ id (PK)      │ │ id (PK)          │
│ user_id (FK)   │ │ user_id (FK) │ │ user_id (FK)     │
│ plan_type      │ │ description  │ │ amount           │
│ status         │ │ image_url    │ │ status           │
│ generations... │ │ created_at   │ │ created_at       │
│ stripe_ids     │ └──────────────┘ └──────────────────┘
└────────────────┘
```

## 🐳 Docker Container Architecture

```
docker-compose.yml
    │
    ├─── mariadb (Container)
    │    ├─ Image: mariadb:11
    │    ├─ Port: 3306
    │    ├─ Volume: mariadb_data
    │    └─ Health Check: mysqladmin ping
    │
    ├─── backend (Container)
    │    ├─ Build: ./backend/Dockerfile
    │    ├─ Port: 3001
    │    ├─ Depends: mariadb
    │    └─ Command: npm run migrate && npm start
    │
    └─── frontend (Container)
         ├─ Build: ./frontend/Dockerfile
         ├─ Port: 3000 (nginx)
         ├─ Depends: backend
         └─ Serves: Static built React app

Network: fursona-network (bridge)
```

## 📡 API Endpoints Summary

```
┌────────────────────────────────────────────────────────┐
│                    PUBLIC ENDPOINTS                     │
├────────────────────────────────────────────────────────┤
│ POST   /api/auth/register          Register new user   │
│ POST   /api/auth/login             Login user          │
│ GET    /api/subscription/plans     Get pricing plans   │
│ POST   /api/webhook/stripe         Stripe webhooks     │
│ GET    /health                     Health check        │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│               AUTHENTICATED ENDPOINTS                   │
│                 (Require JWT Token)                     │
├────────────────────────────────────────────────────────┤
│ GET    /api/auth/me                Get current user    │
│ POST   /api/fursona/generate       Generate fursona    │
│ GET    /api/fursona/history        Get user's history  │
│ GET    /api/subscription/current   Get subscription    │
│ POST   /api/subscription/checkout  Create checkout     │
│ POST   /api/subscription/portal    Billing portal      │
└────────────────────────────────────────────────────────┘
```

## 🔑 Environment Variables Flow

```
Backend .env                    Frontend .env
    │                               │
    ├─ DB_HOST ────────────────────────→ Database Connection
    ├─ DB_USER                      │
    ├─ DB_PASSWORD                  │
    ├─ JWT_SECRET ─────────────────────→ Token Signing
    ├─ OPENAI_API_KEY ─────────────────→ AI Generation
    ├─ STRIPE_SECRET_KEY ──────────────→ Payment Processing
    │                               │
    │                               ├─ VITE_API_URL
    │                               └─ VITE_STRIPE_KEY
    │                                   │
    │                                   └→ Checkout Pages
    │
    └─ STRIPE_WEBHOOK_SECRET
        └→ Webhook Verification
```

## 📊 Subscription Tiers

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│     FREE     │  │    BASIC     │  │     PRO      │
├──────────────┤  ├──────────────┤  ├──────────────┤
│    $0/mo     │  │  $9.99/mo    │  │  $19.99/mo   │
│              │  │              │  │              │
│ 5 gens/month │  │ 50 gens/month│  │  Unlimited   │
│ Basic AI     │  │ Enhanced AI  │  │  Best AI     │
│ Community    │  │ Priority     │  │ Priority     │
│              │  │ History      │  │ History      │
│              │  │              │  │ Early Access │
└──────────────┘  └──────────────┘  └──────────────┘
     Default         Stripe            Stripe
                   price_basic        price_pro
```

## 🚀 Deployment Architecture

```
                    PRODUCTION
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    ┌───▼────┐    ┌────▼────┐    ┌────▼─────┐
    │ Nginx  │    │  Node   │    │ MariaDB  │
    │Frontend│    │ Backend │    │ Database │
    │:80/443 │    │  :3001  │    │  :3306   │
    └────────┘    └─────────┘    └──────────┘
        │               │
        └───────┬───────┘
                │
            ┌───▼────┐
            │  SSL   │
            │  Cert  │
            └────────┘
```

This architecture provides:
✅ Scalability
✅ Security
✅ Separation of Concerns
✅ Easy Maintenance
✅ Docker Portability
