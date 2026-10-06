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
  // Dependendo do tipo de columna que reporte o servidor, o driver pode
  // devolver os JSONB coma obxecto xa parseado ou coma cadea JSON.
  const asMarks = (v: unknown): Record<string, boolean> =>
    (typeof v === "string" ? JSON.parse(v) : v) as Record<string, boolean>;
  const asSeats = (v: unknown): Record<string, number> =>
    (typeof v === "string" ? JSON.parse(v) : v) as Record<string, number>;
  return {
    code: r.code as string,
    title: r.title as string,
    seats: asSeats(r.seats),
    governs: asMarks(r.governs),
    allies: asMarks(r.allies),
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
    openGraph: { title, description },
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
