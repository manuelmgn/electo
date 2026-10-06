import { NextResponse } from "next/server";
import { sql, dbConfigured } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { validateSeats, insertSeats } from "@/lib/predictions";

type RouteCtx = { params: Promise<{ id: string }> };

async function ownsPrediction(userId: number, id: number): Promise<boolean> {
  const { rows } =
    await sql`SELECT id FROM predictions WHERE id = ${id} AND user_id = ${userId}`;
  return rows.length > 0;
}

async function parseOwnedId(ctx: RouteCtx, userId: number): Promise<number | null> {
  const { id } = await ctx.params;
  const predictionId = Number(id);
  if (!Number.isInteger(predictionId)) return null;
  return (await ownsPrediction(userId, predictionId)) ? predictionId : null;
}

export async function PUT(req: Request, ctx: RouteCtx) {
  if (!dbConfigured()) {
    return NextResponse.json({ message: "no-db" }, { status: 500 });
  }
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "need-login" }, { status: 401 });
  }

  const predictionId = await parseOwnedId(ctx, user.id);
  if (predictionId === null) {
    return NextResponse.json({ message: "invalid-data" }, { status: 404 });
  }

  let body: { title?: string; seats?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "invalid-data" }, { status: 400 });
  }

  const entries = validateSeats(body.seats);
  if (!entries) {
    return NextResponse.json({ message: "invalid-data" }, { status: 400 });
  }

  try {
    await sql`DELETE FROM prediction_seats WHERE prediction_id = ${predictionId}`;
    await insertSeats(predictionId, entries);
    const title = body.title?.trim() || "Predición";
    await sql`
      UPDATE predictions SET title = ${title}, updated_at = now()
      WHERE id = ${predictionId}
    `;
    return NextResponse.json({ id: predictionId });
  } catch {
    return NextResponse.json({ message: "errorGeneric" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  if (!dbConfigured()) {
    return NextResponse.json({ message: "no-db" }, { status: 500 });
  }
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
