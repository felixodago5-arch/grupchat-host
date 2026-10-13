import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/chat",
        destination: "http://localhost:3001/chat",
      },
      {
        source: "/chat/:path+",
        destination: "http://localhost:3001/chat/:path+",
      },
      {
        source: "/chat-static/:path+",
        destination: "http://localhost:3001/chat-static/:path+",
      },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
