import { NextResponse } from "next/server";
import { sql, dbConfigured } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PARTIES, TOTAL_SEATS } from "@/lib/parties";

function validateSeats(raw: unknown): { partyId: string; seats: number }[] | null {
  if (typeof raw !== "object" || raw === null) return null;
  const validIds = new Set(PARTIES.map((p) => p.id));
  const entries: { partyId: string; seats: number }[] = [];
  for (const [partyId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!validIds.has(partyId)) continue;
    const seats = Number(value);
    if (!Number.isInteger(seats) || seats < 0) return null;
    if (seats > 0) entries.push({ partyId, seats });
  }
  const sum = entries.reduce((acc, e) => acc + e.seats, 0);
  return sum === TOTAL_SEATS ? entries : null;
}

export async function POST(req: Request) {
  if (!dbConfigured()) {
    return NextResponse.json({ message: "no-db" }, { status: 500 });
  }
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "need-login" }, { status: 401 });
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

  const title = body.title?.trim() || "Predición";
  const { rows } = await sql`
    INSERT INTO predictions (user_id, title)
    VALUES (${user.id}, ${title})
    RETURNING id
  `;
  const predictionId = rows[0].id as number;

  for (const e of entries) {
    await sql`
      INSERT INTO prediction_seats (prediction_id, party_id, seats)
      VALUES (${predictionId}, ${e.partyId}, ${e.seats})
    `;
  }

  return NextResponse.json({ id: predictionId });
}
