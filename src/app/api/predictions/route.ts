import { NextResponse } from "next/server";
import { sql, dbConfigured } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { validateSeats, insertSeats } from "@/lib/predictions";

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

  try {
    const title = body.title?.trim() || "Predición";
    const rows = await sql`
      INSERT INTO predictions (user_id, title)
      VALUES (${user.id}, ${title})
      RETURNING id
    `;
    const predictionId = rows[0].id as number;
    await insertSeats(predictionId, entries);
    return NextResponse.json({ id: predictionId });
  } catch {
    return NextResponse.json({ message: "errorGeneric" }, { status: 500 });
  }
}
