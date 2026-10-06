import { ImageResponse } from "next/og";
import { PARTIES } from "@/lib/parties";
import { sql, dbConfigured } from "@/lib/db";
import { OgHemicycleImage } from "@/lib/og-hemicycle";
import { viewSummary } from "@/lib/views";

export const dynamic = "force-dynamic";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Sen base de datos, código inválido ou calquera erro: imaxe por defecto.
function fallback() {
  return new Response(null, {
    status: 302,
    headers: { location: "/electo-social.png" },
  });
}

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[A-Za-z0-9]{20}$/.test(code) || !dbConfigured()) return fallback();
  try {
    const rows = await sql`
      SELECT title, seats FROM shared_predictions WHERE code = ${code}
    `;
    if (rows.length === 0) return fallback();
    const title = (rows[0].title as string) || "Predición compartida";
    const seats = rows[0].seats as Record<string, number>;
    const summary = viewSummary(
      { slug: "", key: "", seats, government: {}, allies: {} },
      PARTIES
    );
    return new ImageResponse(
      <OgHemicycleImage title={title} summary={summary} seatMap={seats} />,
      size
    );
  } catch {
    return fallback();
  }
}
