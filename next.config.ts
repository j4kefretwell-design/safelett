import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@supabase/supabase-js",
    "@supabase/ssr",
    "@anthropic-ai/sdk",
    "jspdf",
    "jspdf-autotable",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [55, 60, 65, 70, 75],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    const immutable = [
      {
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      },
    ];

    return [
      { source: "/_next/static/:path*", headers: immutable },
      { source: "/:path*.ico", headers: immutable },
      { source: "/:path*.png", headers: immutable },
      { source: "/:path*.jpg", headers: immutable },
      { source: "/:path*.jpeg", headers: immutable },
      { source: "/:path*.webp", headers: immutable },
      { source: "/:path*.avif", headers: immutable },
      { source: "/:path*.svg", headers: immutable },
      { source: "/:path*.woff", headers: immutable },
      { source: "/:path*.woff2", headers: immutable },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
