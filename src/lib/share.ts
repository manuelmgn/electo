// ============================================================
// COMPARTIR PREDICIÓNS POR LIGAZÓN
// ------------------------------------------------------------
// Codifica o estado do editor (escaños + goberno) nun código
// base64url curto que vai no hash da URL (#p=...). Así a ligazón
// garda os resultados por si mesma, sen base de datos.
// ============================================================

export type SharedPrediction = {
  v: 1;
  seats: Record<string, number>;
  governs: Record<string, boolean>;
  allies: Record<string, boolean>;
};

// Empaquetan os datos: omiten partidos con 0 escaños e checks a
// false para acurtar a ligazón todo o posible.
export function encodeShare(  seats: Record<string, number>,
  governs: Record<string, boolean>,
  allies: Record<string, boolean>
): string {
  const payload: SharedPrediction = {
    v: 1,
    seats: Object.fromEntries(Object.entries(seats).filter(([, n]) => n > 0)),
    governs: Object.fromEntries(Object.entries(governs).filter(([, b]) => b)),
    allies: Object.fromEntries(Object.entries(allies).filter(([, b]) => b)),
  };
  return btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Devolve null se o código non é válido (liga malfeita, datos
// cortados...), para non romper a app ao cargar.
export function decodeShare(code: string): SharedPrediction | null {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const data = JSON.parse(atob(b64));
    if (data && typeof data === "object" && typeof data.seats === "object") {
      return {
        v: 1,
        seats: data.seats,
        governs: data.governs ?? {},
        // Ligazóns antigas (sen aliados): quedan sen marca.
        allies: data.allies ?? {},
      };
    }
  } catch {
    // ligazón inválida: ignórase
  }
  return null;
}

// Líneas de texto para copiar ao portapapeis cos 4 partidos con máis
// escaños máis os marcados como goberno ou aliado (aínda que non estean
// entre eses 4). Cada liña: "{emoji} {SIGLAS} - {escaños} - 🏛️/🤝"
// (a marca só aparece se o partido está marcado). As siglas e os escaños
// encólanse cos espazos á anchura do maior de cada bloque, para que os
// guións queden alineados en fonte monoespaciada.
export function buildShareLines(
  seats: Record<string, number>,
  governs: Record<string, boolean>,
  allies: Record<string, boolean>,
  parties: { id: string; short: string; emoji: string }[]
): string[] {
  const ranked = parties
    .map((p) => ({
      ...p,
      n: seats[p.id] ?? 0,
      gov: !!governs[p.id],
      ally: !!allies[p.id],
    }))
    .filter((p) => p.n > 0)
    .sort((a, b) => b.n - a.n);
  const listed = ranked.filter((p, i) => i < 4 || p.gov || p.ally);
  const shortW = Math.max(...listed.map((p) => p.short.length));
  const numW = Math.max(...listed.map((p) => String(p.n).length));
  return listed.map((p) => {
    const mark = p.gov ? "🏛️" : p.ally ? "🤝" : "";
    return `${p.emoji} ${p.short.padEnd(shortW)} - ${String(p.n).padEnd(numW)}${
      mark ? ` - ${mark}` : ""
    }`;
  });
}

// ============================================================
// LIGAZÓNS CURTAS CON CÓDIGO DE 20 CARACTERES (/s/<código>)
// ------------------------------------------------------------
// Cando se comparte unha predición, a API garda o estado na base
// de datos con un código alfanumérico aleatorio de 20 caracteres.
// A aleatoriedade (62^20 combinacións) garante que non se repite;
// a clave primaria da táboa é a última rede de seguridade. A ligazón
// xerada é inmutable: non se actualiza, só se crea.
// ============================================================

const CODE_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// Xera un código de 20 caracteres. Acepta bytes opcionais para poder
// probala de forma determinista nos tests.
export function generateShareCode(random?: Uint8Array): string {
  const bytes = random ?? crypto.getRandomValues(new Uint8Array(20));
  return Array.from(bytes.slice(0, 20), (b) => CODE_ALPHABET[b % 62]).join("");
}
