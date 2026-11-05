import type { NextConfig } from "next";

// Conservative security headers. A strict Content-Security-Policy is left out
// on purpose: Vercel Analytics, logo.dev images and Next's inline runtime need
// careful allow-listing, and a wrong CSP silently breaks sign-in. Add one with
// report-only mode first if you want it. HSTS is already sent by Vercel.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.logo.dev" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
