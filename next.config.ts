import type { NextConfig } from "next";

// Build the connect-src directive dynamically to include the backend API origin
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/app";
const apiOrigin = new URL(apiUrl).origin;

const nextConfig: NextConfig = {
  output: "standalone", // Required for Docker/Cloud Run deployment
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.dev",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https: blob:",
            "font-src 'self' data:",
            `connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.dev ${apiOrigin} https://*.b-cdn.net`,
            "frame-src https://www.youtube.com https://player.vimeo.com https://iframe.mediadelivery.net https://*.clerk.accounts.dev https://*.clerk.dev",
            "media-src 'self' https://*.b-cdn.net https: blob:",
            "worker-src 'self' blob:",
          ].join("; "),
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],
};

export default nextConfig;
