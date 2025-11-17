import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: "export",
  // If you will deploy under https://<user>.github.io/among-us-log-viewer
  basePath: "/among-us-log-viewer",
  // Use unoptimized images in static export
  images: { unoptimized: true },
};

export default nextConfig;
