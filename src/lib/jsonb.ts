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
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as T;
    }
  } catch {
    // JSON mal formado: obxecto baleiro
  }
  return {} as T;
}
