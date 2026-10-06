import crypto from "crypto";

export const SESSION_COOKIE = "electo_session";
export const SESSION_DAYS = 30;

const secret = process.env.SESSION_SECRET ?? "dev-only-secret-change-me";

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function sessionToken(userId: number, now = Date.now()): string {
  const payload = `${userId}.${now}`;
  return `${payload}.${sign(payload)}`;
}

export function parseSession(token?: string | null): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, ts, sig] = parts;

  // Expiración no servidor, ademais do Max-Age da cookie.
  const issuedAt = Number(ts);
  if (
    !Number.isFinite(issuedAt) ||
    Date.now() - issuedAt > SESSION_DAYS * 86_400_000
  ) {
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
