import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/chat",
        destination: "https://grupchat-chat.vercel.app/chat",
      },
      {
        source: "/chat/:path+",
        destination: "https://grupchat-chat.vercel.app/chat/:path+",
      },
      {
        source: "/chat-static/:path+",
        destination: "https://grupchat-chat.vercel.app/chat-static/:path+",
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
