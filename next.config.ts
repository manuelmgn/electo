import type { NextConfig } from "next";

// Os tests E2E (npm run test:e2e) usan un distDir propio (.next-e2e)
// para non partir a caché .next co dev server en marcha ao tempo.
const nextConfig: NextConfig = {
  distDir: process.env.E2E_DIST ? ".next-e2e" : ".next",
};

export default nextConfig;
