import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireDb, readJson } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { validateSeats, insertSeats, DEFAULT_PREDICTION_TITLE } from "@/lib/predictions";

// POST: garda unha predición nova (escaños + título) do usuario da
// sesión. Predición e escaños insértanse nunha transacción: se os
// escaños fallan, non queda predición baleira colgando.
export async function POST(req: Request) {
  const dbError = requireDb();
  if (dbError) return dbError;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "need-login" }, { status: 401 });
  }

  const body = await readJson<{ title?: string; seats?: unknown }>(req);
  if (!body) {
    return NextResponse.json({ message: "invalid-data" }, { status: 400 });
  }

  const entries = validateSeats(body.seats);
  if (!entries) {
    return NextResponse.json({ message: "invalid-data" }, { status: 400 });
  }

  try {
    const title = body.title?.trim().slice(0, 120) || DEFAULT_PREDICTION_TITLE;
    const predictionId = await sql.begin(async (tx) => {
      const preds =
        await tx`INSERT INTO predictions (user_id, title) VALUES (${user.id}, ${title}) RETURNING id`;
      const id = preds[0].id as number;
      await insertSeats(id, entries, tx);
      return id;
    });
    return NextResponse.json({ id: predictionId });
  } catch {
    return NextResponse.json({ message: "errorGeneric" }, { status: 500 });
  }
}
