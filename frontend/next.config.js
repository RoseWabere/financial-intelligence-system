/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from common CDNs if added later
  images: {
    domains: [],
  },
  // Env exposed to browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
