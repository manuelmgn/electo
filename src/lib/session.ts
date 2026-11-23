import crypto from "crypto";

export const SESSION_COOKIE = "electo_session";
export const SESSION_DAYS = 30;

// Expiración en milisegundos (validación no servidor, ademais do
// Max-Age da cookie) e segundos (Max-Age da propia cookie).
export const SESSION_MAX_AGE_MS = SESSION_DAYS * 86_400_000;
export const SESSION_MAX_AGE_S = SESSION_DAYS * 86_400;

const DEV_FALLBACK_SECRET = "dev-only-secret-change-me";
// Marxe máxima de reloxo cara ao futuro (1 min) para evitar tokens
// con marcas de tempo absurdas.
const MAX_FUTURE_SKEW_MS = 60_000;

function getSecret(): string {
  const configured = process.env.SESSION_SECRET?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET obrigatorio en produción");
  }
  return DEV_FALLBACK_SECRET;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
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
  const now = Date.now();
  if (
    !Number.isFinite(issuedAt) ||
    issuedAt <= 0 ||
    issuedAt > now + MAX_FUTURE_SKEW_MS ||
    now - issuedAt > SESSION_MAX_AGE_MS
  ) {
    return null;
  }

  let expected: string;
  try {
    expected = sign(`${userId}.${ts}`);
  } catch {
    return null;
  }
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
    `${SESSION_COOKIE}=; ${cookieBase(0)}`
  );
}
