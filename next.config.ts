// @ts-nocheck
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js you’re using Turbopack (empty object silences the warning)
  turbopack: {},

  // ESLint settings
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Any other config you still need…
  // experimental: { … }
};

export default nextConfig;