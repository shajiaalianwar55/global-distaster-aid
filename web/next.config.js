/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    NEXT_PUBLIC_DONATION_CONTRACT: process.env.NEXT_PUBLIC_DONATION_CONTRACT || '',
    NEXT_PUBLIC_BADGE_CONTRACT: process.env.NEXT_PUBLIC_BADGE_CONTRACT || '',
  },
  webpack: (config, { isServer }) => {
    // Fix for MetaMask SDK trying to use React Native packages (web-only)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

