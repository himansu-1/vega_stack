import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Production setup
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  typescript: {
    // Disable TypeScript errors during builds
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dgg2kgrkj/image/upload/**',
      },
      // Add other image domains as needed
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
