import { sql } from "@/lib/db";
import { PARTIES, TOTAL_SEATS } from "@/lib/parties";

export type SeatEntry = { partyId: string; seats: number };

// Valida o reparto: ids coñecidos, enteiros >= 0 e suma exactamente 350.
// Devolve só os partidos con asentos (> 0), ou null se non é válido.
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

// Inserta todos os asentos nunha soa consulta.
export async function insertSeats(predictionId: number, entries: SeatEntry[]) {
  await sql.query(
    `INSERT INTO prediction_seats (prediction_id, party_id, seats)
     SELECT $1, unnest($2::text[]), unnest($3::int[])`,
    [predictionId, entries.map((e) => e.partyId), entries.map((e) => e.seats)]
  );
}
