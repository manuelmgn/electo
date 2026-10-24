import crypto from "crypto";

export const SESSION_COOKIE = "electo_session";
export const SESSION_DAYS = 30;

// Expiración en milisegundos (validación no servidor, ademais do
// Max-Age da cookie) e segundos (Max-Age da propia cookie).
export const SESSION_MAX_AGE_MS = SESSION_DAYS * 86_400_000;
export const SESSION_MAX_AGE_S = SESSION_DAYS * 86_400;

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
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > SESSION_MAX_AGE_MS) {
    return null;
  }

  const expected = sign(`${userId}.${ts}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const id = Number(userId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Commons da cookie: Path, HttpOnly, SameSite e Secure (só en
// produción, para non romper o http local).
function cookieBase(maxAge: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${maxAge}`;
}

export function setSessionCookie(res: Response, userId: number) {
  res.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${sessionToken(userId)}; ${cookieBase(SESSION_MAX_AGE_S)}`
  );
}

export function clearSessionCookie(res: Response) {
  res.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}
