import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for Docker/Cloud Run deployment
};

export default nextConfig;
