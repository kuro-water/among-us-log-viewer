import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: "export",
  // Only set basePath for production builds (e.g., GitHub Pages)
  basePath: isProduction ? "/among-us-log-viewer" : undefined,
  // Use unoptimized images in static export
  images: { unoptimized: true },
};

export default nextConfig;
