import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
// Allow disabling basePath for E2E or local testing in CI by setting
// DISABLE_BASEPATH=true. When disabled, the app will be served from '/'.
const basePathEnabled = isProduction && process.env.DISABLE_BASEPATH !== "true";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: "export",
  // Only set basePath for production builds (e.g., GitHub Pages)
  basePath: basePathEnabled ? "/among-us-log-viewer" : undefined,
  // Use unoptimized images in static export
  images: { unoptimized: true },
};

export default nextConfig;
