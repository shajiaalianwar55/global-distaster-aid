# Disaster Relief Backend API

Backend API for the disaster relief donation app.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - MongoDB connection string
   - Stripe API keys (for fiat donations)
   - Smart contract addresses (after deployment)
   - Private key for contract interactions

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user

### Verification
- `POST /api/verify/location` - Verify user location
- `POST /api/verify/review` - Review verification request (admin)
- `GET /api/verify/pending` - Get pending verification requests (admin)

### Users
- `GET /api/users/:userId` - Get user profile

### Donations
- `POST /api/donations/fiat` - Create fiat donation (Stripe)
- `POST /api/donations/webhook` - Stripe webhook handler
- `GET /api/donations/history/:userId` - Get donation history

### Recipients
- `GET /api/recipients/verified` - Get all verified recipients

## Environment Variables

- `PORT` - Server port (default: 3001)
- `MONGODB_URI` - MongoDB connection string
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `DONATION_CONTRACT_ADDRESS` - Deployed donation contract address
- `VERIFICATION_BADGE_CONTRACT_ADDRESS` - Deployed badge contract address
- `PRIVATE_KEY` - Private key for contract interactions
- `RPC_URL` - Base network RPC URL

