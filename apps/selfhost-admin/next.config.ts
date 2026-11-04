import path from "node:path";
import type { NextConfig } from "next";

// Lives under /admin on the same address as the web app, which forwards that
// prefix here (apps/web/selfhost/server.ts), so the web app's login cookie
// reaches it unchanged.
const nextConfig: NextConfig = {
  basePath: "/admin",
  output: "standalone",
  outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
  poweredByHeader: false,
  transpilePackages: [
    "@captureflow/admin",
    "@captureflow/mail",
    "@captureflow/quota",
    "@captureflow/selfhost",
    "@captureflow/shared",
    "@captureflow/ui",
  ],
};

export default nextConfig;
