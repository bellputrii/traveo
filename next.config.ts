import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '103.103.20.102',
        port: '',
        pathname: '/files/public/**',
      },
    ],
  },
  // Ignore TypeScript errors selama build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore ESLint errors selama build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
