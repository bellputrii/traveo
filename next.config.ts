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
};

export default nextConfig;
