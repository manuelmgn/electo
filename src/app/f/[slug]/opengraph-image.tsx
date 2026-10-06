import { ImageResponse } from "next/og";
import { PARTIES } from "@/lib/parties";
import { OgHemicycleImage } from "@/lib/og-hemicycle";
import { getForecastView, viewSummary } from "@/lib/views";

export const dynamic = "force-dynamic";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Se o slug non existe, redirixe á imaxe social por defecto.
function fallback() {
  return new Response(null, {
    status: 302,
    headers: { location: "/electo-social.png" },
  });
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = getForecastView(slug);
  if (!view) return fallback();
  const summary = viewSummary(view, PARTIES);
  return new ImageResponse(
    (
      <OgHemicycleImage
        title={`Pronóstico ${view.key}`}
        summary={summary}
        seatMap={view.seats}
      />
    ),
    size
  );
}
