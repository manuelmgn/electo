import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { requireDb, readJson } from "@/lib/api";
import { setSessionCookie } from "@/lib/auth";

// Límites de lonxitude (acordados coas restricións de schema.sql).
const MAX_NAME = 60;
const MAX_EMAIL = 254;
const MIN_PASSWORD = 6;

export async function POST(req: Request) {
  const dbError = requireDb();
  if (dbError) return dbError;

  const body = await readJson<{ name?: string; email?: string; password?: string }>(req);
  if (!body) {
    return NextResponse.json({ message: "invalid-data" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!name || !email.includes("@") || !password) {
    return NextResponse.json({ message: "invalid-data" }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD) {
    return NextResponse.json({ message: "short-password" }, { status: 400 });
  }
  if (name.length > MAX_NAME || email.length > MAX_EMAIL) {
    return NextResponse.json({ message: "invalid-data" }, { status: 400 });
  }

  try {
    const existing = await sql`SELECT 1 FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ message: "email-used" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const rows = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHash})
      RETURNING id, name, email
    `;

    const res = NextResponse.json({ user: rows[0] });
    setSessionCookie(res, rows[0].id as number);
    return res;
  } catch (err) {
    console.error("[register] erro:", err);
    return NextResponse.json({ message: "errorGeneric" }, { status: 500 });
  }
}
