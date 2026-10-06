import { PARTIES, axisValue, type Party } from "./parties";

export type HemicycleSeat = {
  x: number;
  y: number;
  color: string;
  party: Party;
  count: number;
};

export const HEMICYCLE = {
  cx: 200, // centro X
  cy: 210, // centro Y (base do semicírculo)
  rInner: 64,
  rOuter: 188,
  rows: 10,
  seatRadius: 5.6,
  marginRad: (6 * Math.PI) / 180, // marxe nos extremos
} as const;

// Xeración dos asentos: filas concéntricas proporcionais ao raio,
// ordenadas esquerda → dereita polo eixo (-3 a 3) do partido.
export function buildSeats(seats: Record<string, number>): HemicycleSeat[] {
  const total = Object.values(seats).reduce((a, b) => a + b, 0);
  if (total <= 0) return [];

  const order = PARTIES.map((p, i) => ({ p, i })).sort(
    (a, b) => axisValue(a.p) - axisValue(b.p) || a.i - b.i
  );

  const radii = Array.from(
    { length: HEMICYCLE.rows },
    (_, i) =>
      HEMICYCLE.rInner +
      ((HEMICYCLE.rOuter - HEMICYCLE.rInner) * i) / (HEMICYCLE.rows - 1)
  );
  const sumR = radii.reduce((a, b) => a + b, 0);

  // Reparto de asentos por fila proporcional ao raio (con axuste de
  // restos para que sume exactamente o total).
  const exact = radii.map((r) => (total * r) / sumR);
  const counts = exact.map(Math.floor);
  let remaining = total - counts.reduce((a, b) => a + b, 0);
  const byFrac = exact
    .map((e, i) => ({ f: e - counts[i], i }))
    .sort((a, b) => b.f - a.f);
  for (let k = 0; k < remaining; k++) counts[byFrac[k].i]++;

  // Posicións angulares: ángulo π = esquerda, 0 = dereita.
  const span = Math.PI - 2 * HEMICYCLE.marginRad;
  const positions: { angle: number; r: number }[] = [];
  for (let i = 0; i < HEMICYCLE.rows; i++) {
    const n = counts[i];
    for (let j = 0; j < n; j++) {
      const angle =
        Math.PI - HEMICYCLE.marginRad - ((j + 0.5) / n) * span;
      positions.push({ angle, r: radii[i] });
    }
  }
  // Esquerda → dereita; no mesmo ángulo, fila exterior primeiro.
  positions.sort((a, b) => b.angle - a.angle || b.r - a.r);

  const out: HemicycleSeat[] = [];
  let idx = 0;
  for (const { p } of order) {
    const n = seats[p.id] ?? 0;
    for (let k = 0; k < n && idx < positions.length; k++, idx++) {
      const { angle, r } = positions[idx];
      out.push({
        x: HEMICYCLE.cx + r * Math.cos(angle),
        y: HEMICYCLE.cy - r * Math.sin(angle),
        color: p.color,
        party: p,
        count: n,
      });
    }
  }
  return out;
}
