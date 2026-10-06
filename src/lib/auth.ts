import { cookies } from "next/headers";
import { sql, dbConfigured } from "./db";
import {
  SESSION_COOKIE,
  parseSession,
  setSessionCookie,
  clearSessionCookie,
} from "./session";

export { SESSION_COOKIE, setSessionCookie, clearSessionCookie };

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
