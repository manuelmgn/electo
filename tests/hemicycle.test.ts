import { describe, expect, it } from "vitest";
import { buildSeats, HEMICYCLE } from "@/lib/hemicycle";
import { PARTIES, TOTAL_SEATS, axisValue } from "@/lib/parties";

function byId(seats: Record<string, number>) {
  const out: Record<string, number> = {};
  for (const s of buildSeats(seats)) out[s.party.id] = (out[s.party.id] ?? 0) + 1;
  return out;
}

describe("buildSeats", () => {
  it("xera exactamente un asento por escano", () => {
    expect(buildSeats({})).toHaveLength(0);
    expect(buildSeats({ pp: 37 })).toHaveLength(37);
    expect(buildSeats({ pp: TOTAL_SEATS })).toHaveLength(TOTAL_SEATS);
  });

  it("cada partido recibe os seus asentos", () => {
    const seats = { psoe: 150, pp: 120, vox: 50, bng: 30 };
    expect(byId(seats)).toEqual(seats);
  });

  it("as coordenadas están dentro do viewBox e son finitas", () => {
    for (const s of buildSeats({ pp: 137, psoe: 121, vox: 33, fe: 27, jxc: 7, erc: 7, ehb: 6, pnv: 5, podemos: 4, bng: 1, upn: 1, cc: 1 })) {
      expect(Number.isFinite(s.x)).toBe(true);
      expect(Number.isFinite(s.y)).toBe(true);
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThanOrEqual(400);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeLessThanOrEqual(224);
    }
  });

  it("os partidos de esquerda van á esquerda e os de dereita á dereita", () => {
    const seats = { psoe: 100, pp: 100, vox: 50 };
    const all = buildSeats(seats);
    const left = all.slice(0, 20);
    const right = all.slice(-20);
    expect(left.every((s) => axisValue(s.party) < 0)).toBe(true);
    expect(right.every((s) => axisValue(s.party) > 0)).toBe(true);
  });

  it("os empates de eixo manteñen a orde da táboa", () => {
    // Dous partidos co mesmo axis (calquera que empare na táboa):
    // o que vai primeiro ocupa os asentos máis á esquerda.
    const byAxis = new Map<number, string[]>();
    for (const p of PARTIES) {
      byAxis.set(p.axis, [...(byAxis.get(p.axis) ?? []), p.id]);
    }
    const pair = [...byAxis.values()].find((ids) => ids.length >= 2);
    expect(pair).toBeDefined();
    const [first, second] = pair!;
    const all = buildSeats({ [first]: 5, [second]: 5 });
    expect(all[0].party.id).toBe(first);
  });

  it("ningún asento colapsa co centro nin sae do semicírculo", () => {
    const all = buildSeats({ pp: 200, psoe: 150 });
    for (const s of all) {
      const d = Math.hypot(s.x - HEMICYCLE.cx, s.y - HEMICYCLE.cy);
      expect(d).toBeGreaterThanOrEqual(HEMICYCLE.rInner - 0.5);
      expect(d).toBeLessThanOrEqual(HEMICYCLE.rOuter + 0.5);
    }
  });
});
