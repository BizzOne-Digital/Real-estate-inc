import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    // Uploaded media is served from MongoDB through /api/uploads/**; static brand assets live in /brand.
    localPatterns: [
      { pathname: "/api/uploads/**", search: "" },
      { pathname: "/brand/**", search: "" },
      { pathname: "/images/**", search: "" },
      { pathname: "/placeholder.svg", search: "" },
    ],
    dangerouslyAllowSVG: false,
    formats: ["image/avif", "image/webp"],
  },
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
