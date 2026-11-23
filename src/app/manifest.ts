import type { MetadataRoute } from "next";

// Manifest PWA: permite "Instalar app" no móbil, apoiado polo
// service worker de public/sw.js (caché de estáticos + sin-conexion).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Electo 26 · Predicións eleccións xerais 2026",
    short_name: "Electo 26",
    description:
      "Crea e comparte as túas predicicións de escaños para as eleccións xerais de España 2026.",
    lang: "gl",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0e15",
    theme_color: "#0b0e15",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
