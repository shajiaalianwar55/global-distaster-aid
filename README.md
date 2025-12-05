# Disaster Relief Donation App

A web application built on Coinbase Base blockchain that facilitates financial donations to verified users in disaster/war zones. The app uses privacy-preserving location verification to ensure donations reach those who truly need help.

## Features

- **Privacy-Preserving Location Verification**: Verifies users are in disaster/war zones without storing exact coordinates
- **Hybrid Verification System**: Automated checks + manual review for accuracy
- **Dual Payment Support**: Accept donations in cryptocurrency (ETH/USDC) and fiat currency
- **Blockchain Integration**: Built on Base (Layer 2 Ethereum) for transparent, secure transactions
- **Verification Badges**: NFT-based verification system for verified recipients
- **Web Application**: Next.js app deployable to Vercel with responsive design

## Architecture

```
Base/
├── web/             # Next.js web application (deployable to Vercel)
├── contracts/       # Solidity smart contracts for Base blockchain
└── backend/         # Express.js backend API
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- Hardhat (for smart contract deployment)
- Stripe account (for fiat donations)
- Base Sepolia testnet account (for testing)

## Quick Start

### 1. Smart Contracts Setup

```bash
cd contracts
npm install
```

Create a `.env` file:
```
PRIVATE_KEY=your_private_key_here
```

Compile contracts:
```bash
npm run compile
```

Deploy to Base Sepolia testnet:
```bash
npm run deploy:base-sepolia
```

Update contract addresses in `web/lib/constants/config.ts` and `backend/.env` after deployment.

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/disaster-relief
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
DONATION_CONTRACT_ADDRESS=0x... (from step 1)
VERIFICATION_BADGE_CONTRACT_ADDRESS=0x... (from step 1)
PRIVATE_KEY=your_private_key
RPC_URL=https://sepolia.base.org
```

Start MongoDB and run the backend:
```bash
npm run dev
```

### 3. Web App Setup

```bash
cd web
npm install
```

Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_DONATION_CONTRACT=0x... (from step 1)
NEXT_PUBLIC_BADGE_CONTRACT=0x... (from step 1)
```

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

### Smart Contracts (`contracts/`)

- **DonationContract.sol**: Handles cryptocurrency donations (ETH/USDC) to verified recipients
- **VerificationBadge.sol**: ERC-721 NFT representing verification badges

### Web App (`web/`)

- **app/**: Next.js App Router pages (home, profile, registration, verification, donation)
- **lib/hooks/**: Custom React hooks (useLocation)
- **lib/services/**: API and blockchain service integrations
- **lib/constants/**: Configuration constants

### Backend (`backend/`)

- **src/routes/**: API route handlers
- **src/models/**: MongoDB schemas
- **src/services/**: Business logic (verification service)

## Key Features Explained

### Location Verification

The app verifies users are in disaster/war zones using:
1. **Automated Check**: Compares location against known disaster/war zone database
2. **External APIs**: Integrates with ReliefWeb, GDACS, and other disaster monitoring services
3. **Manual Review**: Requests requiring human review are flagged for admin approval
4. **Privacy**: Only stores approximate location (~1km precision), not exact coordinates

### Donation Flow

1. **Crypto Donations**: 
   - Donors connect wallet and send ETH/USDC directly to smart contract
   - Funds are held in contract until recipient withdraws
   - All transactions are transparent on Base blockchain

2. **Fiat Donations**:
   - Uses Stripe Checkout for secure payment processing
   - Funds are converted and held in recipient's account
   - Recipients can withdraw via bank transfer or crypto

### Verification Badge System

- Verified recipients receive an ERC-721 NFT badge
- Badges are soulbound (non-transferable)
- Badge metadata includes verification date and zone type
- Badge status can be checked on-chain

## Development

### Testing Smart Contracts

```bash
cd contracts
npm test
```

### Running Backend Tests

```bash
cd backend
npm test
```

### Web App Development

The web app uses Next.js with hot reloading enabled by default. Changes are reflected immediately in the browser.

## Deployment

### Smart Contracts

1. Deploy to Base Sepolia testnet for testing
2. Deploy to Base mainnet for production
3. Update contract addresses in config files

### Backend

1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Configure environment variables
3. Deploy to Heroku, Railway, or your preferred hosting platform
4. Set up Stripe webhook endpoint

### Web App

1. Deploy to Vercel:
   ```bash
   npm i -g vercel
   vercel
   ```
2. Or connect GitHub repository to Vercel for automatic deployments
3. Set environment variables in Vercel dashboard
4. Update API URLs to production endpoints

## Security Considerations

- Wallet connections use browser-based wallet extensions (MetaMask, etc.)
- Location data is rounded to ~1km precision for privacy
- Smart contracts use OpenZeppelin libraries for security
- All API endpoints should be rate-limited in production
- Implement proper authentication/authorization for admin endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on the repository.

## Roadmap

- [ ] Integration with real disaster zone APIs (ReliefWeb, GDACS)
- [ ] Multi-language support
- [ ] Push notifications for donations
- [ ] Admin dashboard for verification review
- [ ] Analytics and reporting
- [ ] Enhanced security features
- [ ] Progressive Web App (PWA) support

