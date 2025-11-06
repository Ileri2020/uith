// @ts-nocheck
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config : any) => {
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });
    return config;
  },
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  // webpack5: false,

  // serverExternalPackages: ["mongoose"],

  // experimental: {
  //   // appDir: true,
  //   esmExternals: "loose", // <-- add this
  //   serverComponentsExternalPackages: ["mongoose"] // <-- and this
  // },

  // and the following to enable top-level await support for Webpack
  // webpack: (config) => {
  //   config.experiments = {
  //     ...config.experiments,
  //     topLevelAwait: true
  //   };
  //   return config;
  // },
};

export default nextConfig;
