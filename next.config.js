/** @type {import('next').NextConfig} */

const createNextIntlPlugin = require('next-intl/plugin');

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  serverExternalPackages: ["pino-pretty"]
};

const withNextIntl = createNextIntlPlugin();
module.exports = withNextIntl(nextConfig);