import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResultsView from "@/components/ResultsView";
import { PARTIES } from "@/lib/parties";
import { getElectionView, viewSummary, ELECTION_VIEWS } from "@/lib/views";

type Params = { params: Promise<{ slug: string }> };

// Vista estática: os datos veñen de táboas de código (sen BD nin
// cookies), así que cada elección pré-renderízase no build.
export function generateStaticParams() {
  return Object.keys(ELECTION_VIEWS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const view = getElectionView(slug);
  if (!view) return {};
  const summary = viewSummary(view, PARTIES);
  const title = `Resultados ${view.key} · Electo 26`;
  const description = `Resultados do Congreso das eleccións xerais de ${view.key}: ${summary}.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary", title, description },
  };
}

export default async function ElectionPage({ params }: Params) {
  const { slug } = await params;
  const view = getElectionView(slug);
  if (!view) notFound();

  return (
    <ResultsView
      title={view.key}
      seats={view.seats}
      government={view.government}
      allies={view.allies}
      shareUrl={`/r/${view.slug}`}
    />
  );
}
