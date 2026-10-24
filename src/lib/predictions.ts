import postgres from "postgres";
import { sql } from "./db";
import { PARTIES, TOTAL_SEATS } from "./parties";

export type SeatEntry = { partyId: string; seats: number };

// Título por defecto dunha predición gardada sen título explícito
// (o editor engade a data; as rutas API usan isto a secas).
export const DEFAULT_PREDICTION_TITLE = "Predición";

// Cliente SQL (global ou transacción de sql.begin) con tagged templates.
type DbClient = postgres.Sql | postgres.TransactionSql;

// Valida o reparto: ids coñecidos, enteiros >= 0 e suma exactamente
// 350. Devolve só os partidos con escaños (> 0), ou null se non é
// válido. Úsase a cotío nas rutas (POST/PUT de predicións e compartir).
export function validateSeats(raw: unknown): SeatEntry[] | null {
  if (typeof raw !== "object" || raw === null) return null;
  const validIds = new Set(PARTIES.map((p) => p.id));
  const entries: SeatEntry[] = [];
  for (const [partyId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!validIds.has(partyId)) continue;
    const seats = Number(value);
    if (!Number.isInteger(seats) || seats < 0) return null;
    if (seats > 0) entries.push({ partyId, seats });
  }
  const sum = entries.reduce((acc, e) => acc + e.seats, 0);
  return sum === TOTAL_SEATS ? entries : null;
}

// Inserta tódolos escaños nunha soa consulta (unnest sobre arrays
// paralelos). Acepta o cliente SQL para executarse dentro dunha
// transacción (sql.begin); por defecto usa o global.
export async function insertSeats(
  predictionId: number,
  entries: SeatEntry[],
  db: DbClient = sql
) {
  await db`
    INSERT INTO prediction_seats (prediction_id, party_id, seats)
    SELECT ${predictionId},
           unnest(${entries.map((e) => e.partyId)}::text[]),
           unnest(${entries.map((e) => e.seats)}::int[])
  `;
}
