import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, dbConfigured } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  if (!dbConfigured()) {
    return NextResponse.json({ message: "no-db" }, { status: 500 });
  }

  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "invalid-data" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!name || !email || !email.includes("@") || !password) {
    return NextResponse.json({ message: "invalid-data" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ message: "short-password" }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.rows.length > 0) {
    return NextResponse.json({ message: "email-used" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await sql`
    INSERT INTO users (name, email, password_hash)
    VALUES (${name}, ${email}, ${passwordHash})
    RETURNING id, name, email
  `;

  const res = NextResponse.json({ user: rows[0] });
  setSessionCookie(res, rows[0].id as number);
  return res;
}
