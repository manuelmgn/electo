import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResultsView from "@/components/ResultsView";
import { PARTIES } from "@/lib/parties";
import { getForecastView, viewSummary, FORECAST_VIEWS } from "@/lib/views";

type Params = { params: Promise<{ slug: string }> };

// Vista estática: só os pronósticos publicados (FORECAST_VIEWS)
// pre-renderízanse no build; os slugs novos renderizan a runtime.
export function generateStaticParams() {
  return Object.keys(FORECAST_VIEWS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const view = getForecastView(slug);
  if (!view) return {};
  const summary = viewSummary(view, PARTIES);
  const title = `Pronóstico ${view.key} · Electo 26`;
  const description = `Pronóstico de escaños para as eleccións xerais 2026 (${view.key}): ${summary}.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary", title, description },
  };
}

export default async function ForecastPage({ params }: Params) {
  const { slug } = await params;
  const view = getForecastView(slug);
  if (!view) notFound();

  return (
    <ResultsView
      title={view.key}
      seats={view.seats}
      government={view.government}
      allies={view.allies}
      shareUrl={`/f/${view.slug}`}
    />
  );
}
