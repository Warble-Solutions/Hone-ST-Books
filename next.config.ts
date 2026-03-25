import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  serverExternalPackages: ["razorpay"],
  turbopack: {},
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
