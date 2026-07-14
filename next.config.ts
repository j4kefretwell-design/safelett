import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@supabase/supabase-js", "@supabase/ssr"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 65, 70, 75],
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

export default nextConfig;
