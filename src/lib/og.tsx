// ============================================================
// IMAXES OPENGRAPH COMPARTE
// ------------------------------------------------------------
// Constantes e axudantes comúns ás tres rutas dinámicas de imaxe
// social: /f/[slug]/opengraph-image, /r/[slug]/opengraph-image e
// /s/[code]/opengraph-image. O debuxo do hemiciclo está en
// og-hemicycle.tsx (reutiliza buildSeats do hemiciclo web).
// ============================================================

import { ImageResponse } from "next/og";
import { OgHemicycleImage } from "@/lib/og-hemicycle";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// Sen datos (slug/código descoñecido, base de datos caída...): non
// se xera imaxe, rediríxese á imaxe social estática por defecto.
export function ogFallback(): Response {
  return new Response(null, {
    status: 302,
    headers: { location: "/electo-social.png" },
  });
}

// Xera a imaxe do hemiciclo co título e o resumo de partidos dados.
export function ogHemicycle(params: {
  title: string;
  summary: string;
  seatMap: Record<string, number>;
}): Response {
  return new ImageResponse(
    <OgHemicycleImage
      title={params.title}
      summary={params.summary}
      seatMap={params.seatMap}
    />,
    ogSize
  );
}
