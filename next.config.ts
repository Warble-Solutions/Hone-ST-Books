import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["razorpay"],
  turbopack: {},
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
