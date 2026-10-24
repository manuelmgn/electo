import {
  ogFallback,
  ogHemicycle,
} from "@/lib/og";
import { PARTIES } from "@/lib/parties";
import { getElectionView, viewSummary } from "@/lib/views";

export const dynamic = "force-dynamic";
export { ogSize as size, ogContentType as contentType } from "@/lib/og";

// Se o slug non existe: imaxe social por defecto.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = getElectionView(slug);
  if (!view) return ogFallback();
  return ogHemicycle({
    title: `Resultados ${view.key}`,
    summary: viewSummary(view, PARTIES),
    seatMap: view.seats,
  });
}
