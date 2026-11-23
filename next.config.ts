import type { NextConfig } from "next";

// Cabeceiras de seguridade comúns a tódalas rutas (protección fronte
// a clickjacking, MIME sniffing, fugas de Referrer e funcións sen uso).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'none'",
  },
];

// Os tests E2E (npm run test:e2e) usan un distDir propio (.next-e2e)
// para non partir a caché .next co dev server en marcha ao tempo.
const nextConfig: NextConfig = {
  distDir: process.env.E2E_DIST ? ".next-e2e" : ".next",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
