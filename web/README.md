# Disaster Relief Web App

Next.js web application for the disaster relief donation platform, deployable to Vercel.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_DONATION_CONTRACT=0x...
NEXT_PUBLIC_BADGE_CONTRACT=0x...
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
   - `NEXT_PUBLIC_DONATION_CONTRACT` - Deployed contract address
   - `NEXT_PUBLIC_BADGE_CONTRACT` - Deployed contract address
4. Deploy!

Or use Vercel CLI:
```bash
npm i -g vercel
vercel
```

## Features

- Wallet connection (MetaMask, injected wallets)
- Location verification using browser geolocation API
- Crypto donations (ETH/USDC) via Base blockchain
- Fiat donations via Stripe
- Responsive design with Tailwind CSS

