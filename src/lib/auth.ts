import crypto from "crypto";
import { cookies } from "next/headers";
import { sql, dbConfigured } from "./db";

export const SESSION_COOKIE = "electo_session";
const SESSION_DAYS = 30;

const secret = process.env.SESSION_SECRET ?? "dev-only-secret-change-me";

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function sessionToken(userId: number): string {
  const payload = `${userId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function parseSession(token?: string | null): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, ts, sig] = parts;

  // Expiración no servidor, ademais do Max-Age da cookie.
  const issuedAt = Number(ts);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > SESSION_DAYS * 86_400_000) {
    return null;
  }

  const expected = sign(`${userId}.${ts}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const id = Number(userId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function setSessionCookie(res: Response, userId: number) {
  res.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${sessionToken(userId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`
  );
}

export function clearSessionCookie(res: Response) {
  res.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

export type SessionUser = { id: number; name: string; email: string };

export async function getSessionUser(): Promise<SessionUser | null> {
  // cookies() vai primeiro: opta por render dinámico. Se se devolvésese
  // null antes, a páxina podería quedar prerenderizada co estado
  // "sen sesión" (p. ex. no build, cando aínda non hai POSTGRES_URL).
  const store = await cookies();
  const userId = parseSession(store.get(SESSION_COOKIE)?.value);
  if (!userId || !dbConfigured()) return null;
  try {
    const rows = await sql`SELECT id, name, email FROM users WHERE id = ${userId}`;
    return (rows[0] as SessionUser) ?? null;
  } catch {
    return null;
  }
}
