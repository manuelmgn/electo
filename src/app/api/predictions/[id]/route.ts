import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireDb, readJson } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { validateSeats, insertSeats, DEFAULT_PREDICTION_TITLE } from "@/lib/predictions";

type RouteCtx = { params: Promise<{ id: string }> };

// Comproba que a predición existe e é do usuario da sesión.
async function ownsPrediction(userId: number, id: number): Promise<boolean> {
  const rows =
    await sql`SELECT id FROM predictions WHERE id = ${id} AND user_id = ${userId}`;
  return rows.length > 0;
}

async function parseOwnedId(ctx: RouteCtx, userId: number): Promise<number | null> {
  const { id } = await ctx.params;
  const predictionId = Number(id);
  if (!Number.isInteger(predictionId)) return null;
  return (await ownsPrediction(userId, predictionId)) ? predictionId : null;
}

// PUT: actualiza título e reparto dunha predición propia. Borrado e
// reinserto de escaños + UPDATE do título van nunha transacción: si
// algo falla pola metade, queda o estado anterior intacto.
export async function PUT(req: Request, ctx: RouteCtx) {
  const dbError = requireDb();
  if (dbError) return dbError;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "need-login" }, { status: 401 });
  }

  const predictionId = await parseOwnedId(ctx, user.id);
  if (predictionId === null) {
    return NextResponse.json({ message: "invalid-data" }, { status: 404 });
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
    await sql.begin(async (tx) => {
      await tx`DELETE FROM prediction_seats WHERE prediction_id = ${predictionId}`;
      await insertSeats(predictionId, entries, tx);
      // updated_at: pono explícito porque bases de datos anteriores ao
      // trigger de schema.sql non o terían automático.
      await tx`
        UPDATE predictions SET title = ${title}, updated_at = now()
        WHERE id = ${predictionId}
      `;
    });
    return NextResponse.json({ id: predictionId });
  } catch {
    return NextResponse.json({ message: "errorGeneric" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const dbError = requireDb();
  if (dbError) return dbError;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "need-login" }, { status: 401 });
  }

  const predictionId = await parseOwnedId(ctx, user.id);
  if (predictionId === null) {
    return NextResponse.json({ message: "invalid-data" }, { status: 404 });
  }

  try {
    // prediction_seats bórrase pola ON DELETE CASCADE da FK.
    await sql`DELETE FROM predictions WHERE id = ${predictionId}`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "errorGeneric" }, { status: 500 });
  }
}
