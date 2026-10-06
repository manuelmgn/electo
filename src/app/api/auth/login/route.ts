import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, dbConfigured } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  if (!dbConfigured()) {
    return NextResponse.json({ message: "no-db" }, { status: 500 });
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "invalid-data" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!email || !password) {
    return NextResponse.json({ message: "invalid-data" }, { status: 400 });
  }

  try {
    const rows =
      await sql`SELECT id, name, email, password_hash FROM users WHERE email = ${email}`;
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ message: "bad-credentials" }, { status: 401 });
    }

    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
    setSessionCookie(res, user.id as number);
    return res;
  } catch {
    return NextResponse.json({ message: "errorGeneric" }, { status: 500 });
  }
}
