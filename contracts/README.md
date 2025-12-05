# Disaster Relief Smart Contracts

Smart contracts deployed on Base blockchain for the disaster relief donation app.

## Contracts

- **DonationContract.sol**: Handles cryptocurrency donations (ETH/USDC) to verified recipients
- **VerificationBadge.sol**: ERC-721 NFT representing verification badges for disaster zone residents

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your private key:
```
PRIVATE_KEY=your_private_key_here
```

3. Compile contracts:
```bash
npm run compile
```

4. Deploy to Base Sepolia testnet:
```bash
npm run deploy:base-sepolia
```

## Network Information

- **Base Sepolia Testnet**: Chain ID 84532, RPC: https://sepolia.base.org
- **Base Mainnet**: Chain ID 8453, RPC: https://mainnet.base.org

