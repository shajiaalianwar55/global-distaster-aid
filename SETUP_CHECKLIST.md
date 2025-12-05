# Setup Checklist

Follow these steps to get the Disaster Relief app up and running:

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] MongoDB installed and running (or MongoDB Atlas account)
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] Base Sepolia testnet account with test ETH
- [ ] Stripe account (for fiat donations)

## Step 1: Smart Contracts

- [ ] Navigate to `contracts/` directory
- [ ] Run `npm install`
- [ ] Create `.env` file with `PRIVATE_KEY=your_private_key`
- [ ] Update `USDC_TOKEN_ADDRESS` in `scripts/deploy.js` if needed
- [ ] Run `npm run compile` to compile contracts
- [ ] Run `npm run deploy:base-sepolia` to deploy to testnet
- [ ] Copy deployed contract addresses

## Step 2: Backend

- [ ] Navigate to `backend/` directory
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Update `.env` with:
  - [ ] MongoDB connection string
  - [ ] Stripe secret key and webhook secret
  - [ ] Contract addresses from Step 1
  - [ ] Private key for contract interactions
- [ ] Start MongoDB (if local): `mongod`
- [ ] Run `npm run dev` to start backend server
- [ ] Verify server is running at `http://localhost:3001/health`

## Step 3: Web App

- [ ] Navigate to `web/` directory
- [ ] Run `npm install`
- [ ] Create `.env.local` file with:
  - [ ] `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
  - [ ] `NEXT_PUBLIC_DONATION_CONTRACT=0x...` (from Step 1)
  - [ ] `NEXT_PUBLIC_BADGE_CONTRACT=0x...` (from Step 1)
- [ ] Run `npm run dev` to start Next.js dev server
- [ ] Open http://localhost:3000 in your browser

## Step 4: Testing

- [ ] Create a test wallet in the app
- [ ] Request location permission
- [ ] Try location verification (may need to be in a test zone or trigger manual review)
- [ ] Test crypto donation flow (if recipient is verified)
- [ ] Test fiat donation flow with Stripe test card

## Troubleshooting

### Contracts won't deploy
- Check you have testnet ETH in your wallet
- Verify RPC URL is correct in `hardhat.config.js`
- Check private key is correct

### Backend won't start
- Verify MongoDB is running
- Check all environment variables are set
- Check port 3001 is not in use

### Web app won't connect to backend
- Verify backend is running
- Check API URL in web `.env.local` matches backend URL
- Check CORS settings in backend allow your frontend URL
- For production, ensure backend CORS includes your Vercel domain

### Location verification fails
- Check location permissions are granted
- Verify backend verification service is working
- Check disaster zone database has test zones configured

## Next Steps

- [ ] Add real disaster zone data sources (ReliefWeb API, GDACS)
- [ ] Set up admin dashboard for verification review
- [ ] Configure Stripe webhook endpoint
- [ ] Deploy to production networks
- [ ] Deploy web app to Vercel
- [ ] Configure production environment variables

