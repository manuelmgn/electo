import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResultsView from "@/components/ResultsView";
import { PARTIES } from "@/lib/parties";
import { getElectionView, viewSummary } from "@/lib/views";

type Params = { params: Promise<{ slug: string }> };

export function generateMetadata({ params }: Params): Promise<Metadata> {
  return params.then(({ slug }) => {
    const view = getElectionView(slug);
    if (!view) return {};
    const summary = viewSummary(view, PARTIES);
    const title = `Resultados ${view.key} · Electo 26`;
    const description = `Resultados do Congreso das eleccións xerais de ${view.key}: ${summary}.`;
    return {
      title,
      description,
      openGraph: { title, description, images: ["/electo-social.png"] },
      twitter: { card: "summary", title, description },
    };
  });
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
