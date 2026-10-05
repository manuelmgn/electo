import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import PredictionsClient from "@/components/PredictionsClient";

export const metadata: Metadata = { title: "As miñas predicicións · Electo 26" };

export type PredictionDto = {
  id: number;
  title: string;
  created_at: string;
  seats: Record<string, number>;
};

export default async function PredictionsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { rows: preds } = await sql`
    SELECT id, title, created_at FROM predictions
    WHERE user_id = ${user.id}
    ORDER BY created_at DESC
  `;
  const seatsByPred: Record<number, Record<string, number>> = {};
  for (const pred of preds) {
    const pid = pred.id as number;
    const { rows: seats } =
      await sql`SELECT party_id, seats FROM prediction_seats WHERE prediction_id = ${pid}`;
    seatsByPred[pid] = Object.fromEntries(
      seats.map((r) => [r.party_id as string, r.seats as number])
    );
  }

  const predictions: PredictionDto[] = preds.map((p) => ({
    id: p.id as number,
    title: p.title as string,
    created_at: (p.created_at as Date).toISOString(),
    seats: seatsByPred[p.id as number] ?? {},
  }));

  return <PredictionsClient predictions={predictions} />;
}
