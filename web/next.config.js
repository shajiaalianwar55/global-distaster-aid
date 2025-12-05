/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    NEXT_PUBLIC_DONATION_CONTRACT: process.env.NEXT_PUBLIC_DONATION_CONTRACT || '',
    NEXT_PUBLIC_BADGE_CONTRACT: process.env.NEXT_PUBLIC_BADGE_CONTRACT || '',
  },
};

module.exports = nextConfig;

