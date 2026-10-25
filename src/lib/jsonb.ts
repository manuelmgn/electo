// ============================================================
// VALORES JSONB
// ------------------------------------------------------------
// Os driver postgres.js pode devolver unha columna JSONB coma
// obxecto xa parseado ou coma cadea JSON, dependendo do servidor.
// Helper común para aceptar ambas as formas con fallback seguro
// (obxecto baleiro) se o dato non é utilizabel.
// ============================================================

export function jsonbObject<T extends object>(value: unknown): T {
  try {
    if (typeof value === "string") return JSON.parse(value) as T;
    if (typeof value === "object" && value !== null) return value as T;
  } catch {
    // JSON mal formado: obxecto baleiro
  }
  return {} as T;
}
