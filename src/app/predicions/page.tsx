import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import PredictionsClient, { type PredictionDto } from "@/components/PredictionsClient";

export const metadata: Metadata = { title: "As miñas predicicións · Electo 26" };

export default async function PredictionsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { rows: preds } = await sql`
    SELECT id, title, created_at FROM predictions
    WHERE user_id = ${user.id}
    ORDER BY created_at DESC
  `;
  const ids = preds.map((p) => p.id as number);

  const seatsByPred: Record<number, Record<string, number>> = {};
  if (ids.length > 0) {
    // Unha soa consulta para todos os asentos (evita N+1).
    const { rows: seats } = await sql.query(
      "SELECT prediction_id, party_id, seats FROM prediction_seats WHERE prediction_id = ANY($1)",
      [ids]
    );
    for (const row of seats) {
      const pid = row.prediction_id as number;
      (seatsByPred[pid] ??= {})[row.party_id as string] = row.seats as number;
    }
  }

  const predictions: PredictionDto[] = preds.map((p) => ({
    id: p.id as number,
    title: p.title as string,
    created_at: (p.created_at as Date).toISOString(),
    seats: seatsByPred[p.id as number] ?? {},
  }));

  return <PredictionsClient predictions={predictions} />;
}
