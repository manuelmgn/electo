import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { requireDb, readJson } from "@/lib/api";
import { setSessionCookie } from "@/lib/auth";

// Hash real (de "electo26-dummy") usado cando non existe o usuario
// que pediu login: cóstase o mesmo ca comparar un contrasinal real e
// así non se filtra por tempo de resposta que un correo ten conta.
const DUMMY_HASH = "$2a$10$taQ/M3k0yGxbisgFCDvcYOnfj4g4dwfYRPpuvHlZiqDUE7oAL1QSC";

export async function POST(req: Request) {
  const dbError = requireDb();
  if (dbError) return dbError;

  const body = await readJson<{ email?: string; password?: string }>(req);
  if (!body) {
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
    const ok = await bcrypt.compare(
      password,
      (user?.password_hash as string) ?? DUMMY_HASH
    );
    if (!user || !ok) {
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
