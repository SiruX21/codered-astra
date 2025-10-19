# Fursona Generator - Backend API

Node.js + Express backend for the Fursona Generator application.

## Features

- RESTful API with Express
- JWT authentication
- MariaDB database with connection pooling
- Stripe payment integration
- OpenAI GPT-4 Vision integration
- Subscription management
- Usage tracking and limits

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Run database migrations:
```bash
npm run migrate
```

4. Start development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run migrate` - Run database migrations

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── database.js      # Database connection
│   │   └── migrate.js       # Database migrations
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── fursona.js       # Fursona generation routes
│   │   ├── subscription.js  # Subscription routes
│   │   └── webhook.js       # Stripe webhook routes
│   └── server.js            # Express app setup
├── package.json
└── .env.example
```

## API Documentation

See main README.md for full API documentation.
