import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Production setup
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
};

export default nextConfig;
