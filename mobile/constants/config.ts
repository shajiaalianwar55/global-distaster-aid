// Base network configuration
export const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
export const BASE_MAINNET_RPC = "https://mainnet.base.org";
export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_MAINNET_CHAIN_ID = 8453;

// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";

// Contract addresses (update after deployment)
export const DONATION_CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_DONATION_CONTRACT || "";
export const VERIFICATION_BADGE_CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_BADGE_CONTRACT || "";

// USDC token address on Base Sepolia
export const USDC_TOKEN_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC

// App configuration
export const APP_NAME = "Disaster Relief";
export const APP_VERSION = "1.0.0";

