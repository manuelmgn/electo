import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireDb, readJson } from "@/lib/api";
import { PARTIES } from "@/lib/parties";
import { validateSeats } from "@/lib/predictions";
import { generateShareCode } from "@/lib/share";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Sanitiza un mapa de marcas (goberno/aliados): só ids de partidos
// coñecidos con valor true, coma fai decodeShare coas ligazóns de hash.
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
// O código de 20 caracteres é aleatorio e único (PK da táboa).
export async function POST(req: Request) {
  const dbError = requireDb();
  if (dbError) return dbError;

  const body = await readJson<{
    title?: string;
    seats?: unknown;
    governs?: unknown;
    allies?: unknown;
  }>(req);
  if (!body) {
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

  // Reintentos:
  //  - 23505 (unique_violation): colisión de código; reintenta con un
  //    código novo (improbable, pero a PK obriga a comprobalo).
  //  - Erros transitorios de conexión (pooler de Neon pechando
  //    conexións en frío, rede...): código 08, 57P01, 55P03 ou errno
  //    de rede; reintenta cunha pausa curta.
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
      const e = err as { code?: string; errno?: string };
      const isTransient =
        (typeof e.code === "string" &&
          (e.code.startsWith("08") || e.code === "57P01" || e.code === "55P03")) ||
        typeof e.errno === "string";
      if (e.code !== "23505" && !(isTransient && attempt < 4)) {
        return NextResponse.json({ message: "errorGeneric" }, { status: 500 });
      }
      await wait(200);
    }
  }
  return NextResponse.json({ message: "errorGeneric" }, { status: 500 });
}
