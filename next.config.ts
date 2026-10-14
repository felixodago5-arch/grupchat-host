import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/chat",
        destination: "https://pppp-f3jq.onrender.com/chat",
      },
      {
        source: "/chat/:path+",
        destination: "https://pppp-f3jq.onrender.com/chat/:path+",
      },
      {
        source: "/chat-static/:path+",
        destination: "https://pppp-f3jq.onrender.com/chat-static/:path+",
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
