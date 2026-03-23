/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['yahoo-finance2', '@anthropic-ai/sdk'],
  },
};

export default nextConfig;
