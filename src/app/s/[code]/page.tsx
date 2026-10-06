import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResultsView from "@/components/ResultsView";
import { PARTIES } from "@/lib/parties";
import { sql, dbConfigured } from "@/lib/db";
import { viewSummary } from "@/lib/views";

type Params = { params: Promise<{ code: string }> };

type SharedRow = {
  code: string;
  title: string;
  seats: Record<string, number>;
  governs: Record<string, boolean>;
  allies: Record<string, boolean>;
};

// Soamente códigos xerados pola API (20 caracteres alfanuméricos).
function isValidCode(code: string): boolean {
  return /^[A-Za-z0-9]{20}$/.test(code);
}

async function loadShared(code: string): Promise<SharedRow | null> {
  if (!dbConfigured() || !isValidCode(code)) return null;
  const rows = await sql`
    SELECT code, title, seats, governs, allies
    FROM shared_predictions
    WHERE code = ${code}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    code: r.code as string,
    title: r.title as string,
    seats: r.seats as Record<string, number>,
    governs: r.governs as Record<string, boolean>,
    allies: r.allies as Record<string, boolean>,
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { code } = await params;
  const row = await loadShared(code);
  if (!row) return {};
  const label = row.title || "Predición compartida";
  const summary = viewSummary(
    { slug: "", key: "", seats: row.seats, government: row.governs, allies: row.allies },
    PARTIES
  );
  const title = `${label} · Electo 26`;
  const description = `Pronóstico de escaños para as eleccións xerais 2026: ${summary}.`;
  return {
    title,
    description,
    openGraph: { title, description, images: ["/logo.png"] },
    twitter: { card: "summary", title, description },
  };
}

export default async function SharedPage({ params }: Params) {
  const { code } = await params;
  const row = await loadShared(code);
  if (!row) notFound();

  return (
    <ResultsView
      title={row.title || "Predición compartida"}
      seats={row.seats}
      government={row.governs}
      allies={row.allies}
      shareUrl={`/s/${row.code}`}
    />
  );
}
