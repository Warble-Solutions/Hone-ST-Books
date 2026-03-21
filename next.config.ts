import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["razorpay"],
  turbopack: {},
};

export default nextConfig;
