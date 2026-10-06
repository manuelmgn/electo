import { NextResponse } from "next/server";
import { sql, dbConfigured } from "@/lib/db";
import { PARTIES } from "@/lib/parties";
import { validateSeats } from "@/lib/predictions";
import { generateShareCode } from "@/lib/share";

// Sanitiza un mapa de marcas (goberno/aliados): só ids de partidos
// coñecidos con valor true, coma fai encodeShare coas ligazóns de hash.
function sanitizeMarks(raw: unknown): Record<string, boolean> {
  if (typeof raw !== "object" || raw === null) return {};
  const validIds = new Set(PARTIES.map((p) => p.id));
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>).filter(
      ([id, v]) => validIds.has(id) && v === true
    )
  ) as Record<string, boolean>;
}

// Crea unha ligazón curta e inmutable para unha predición compartida.
// O código de 20 caracteres é aleatorio e único (PK da táboa); a
// ligazón xerada non se modifica nunca: só se crea.
export async function POST(req: Request) {
  if (!dbConfigured()) {
    return NextResponse.json({ message: "no-db" }, { status: 500 });
  }

  let body: {
    title?: string;
    seats?: unknown;
    governs?: unknown;
    allies?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "invalid-data" }, { status: 400 });
  }

  const entries = validateSeats(body.seats);
  if (!entries) {
    return NextResponse.json({ message: "invalid-data" }, { status: 400 });
  }

  const title = body.title?.trim().slice(0, 120) || "";
  const seats = Object.fromEntries(entries.map((e) => [e.partyId, e.seats]));
  const governs = sanitizeMarks(body.governs);
  const allies = sanitizeMarks(body.allies);

  // Erros transitorios de conexión (pooler de Neon pechando conexións
  // en frío, rede, etc.): o código comeza por 08 (connection exception),
  // ou vén sen código pero con errno de rede (ECONNRESET, ETIMEDOUT...).
  // Reinténtanse antes de render o erro ao cliente.
  const isTransient = (err: unknown): boolean => {
    const e = err as { code?: string; errno?: string };
    if (typeof e?.code === "string") {
      return e.code.startsWith("08") || e.code === "57P01" || e.code === "55P03";
    }
    return typeof e?.errno === "string";
  };

  // Reintenta con código novo se o anterior colisiona (improbable, pero
  // a clave primaria obriga a comprobalo) e reintenta tamén os erros
  // transitorios de conexión, con pausa curta entre intentos.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateShareCode();
    try {
      await sql`
        INSERT INTO shared_predictions (code, title, seats, governs, allies)
        VALUES (
          ${code},
          ${title},
          ${JSON.stringify(seats)}::jsonb,
          ${JSON.stringify(governs)}::jsonb,
          ${JSON.stringify(allies)}::jsonb
        )
      `;
      return NextResponse.json({ code });
    } catch (err) {
      if (isTransient(err) && attempt < 4) {
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }
      if (attempt === 4) {
        return NextResponse.json({ message: "errorGeneric" }, { status: 500 });
      }
      // 23505 = unique_violation: o código xa existe, reintenta.
      if ((err as { code?: string }).code !== "23505") {
        return NextResponse.json({ message: "errorGeneric" }, { status: 500 });
      }
    }
  }
  return NextResponse.json({ message: "errorGeneric" }, { status: 500 });
}
