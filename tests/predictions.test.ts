import { describe, expect, it } from "vitest";
import { validateSeats } from "@/lib/predictions";
import { PARTIES, TOTAL_SEATS } from "@/lib/parties";
import { ELECTION_RESULTS, ELECTION_GOVERNMENT, ELECTION_ALLIES } from "@/lib/results";

describe("validateSeats", () => {
  it("aceita un reparto que suma exactamente 350", () => {
    expect(validateSeats({ pp: 350 })).toEqual([{ partyId: "pp", seats: 350 }]);
  });

  it("reza os partidos con 0 escanos", () => {
    expect(validateSeats({ pp: 350, psoe: 0 })).toEqual([
      { partyId: "pp", seats: 350 },
    ]);
  });

  it("rexeita se a suma non é 350", () => {
    expect(validateSeats({ pp: 100 })).toBeNull();
    expect(validateSeats({ pp: 351 })).toBeNull();
  });

  it("rexeita valores non enteiros ou negativos", () => {
    expect(validateSeats({ pp: 349.5 })).toBeNull();
    expect(validateSeats({ pp: -1 })).toBeNull();
  });

  it("ignora ids descoñecidos", () => {
    expect(validateSeats({ pp: 350, fantasma: 10 })).toEqual([
      { partyId: "pp", seats: 350 },
    ]);
  });

  it("rexeita entradas que non son obxectos", () => {
    expect(validateSeats(null)).toBeNull();
    expect(validateSeats("pp")).toBeNull();
    expect(validateSeats([1, 2])).toBeNull();
  });
});

describe("ELECTION_RESULTS", () => {
  it("todos os partidos referenciados existen na táboa (ou son históricos)", () => {
    const ids = new Set(PARTIES.map((p) => p.id));
    for (const [year, results] of Object.entries(ELECTION_RESULTS)) {
      for (const id of Object.keys(results)) {
        if (!ids.has(id)) {
          console.warn(`${year}: "${id}" non está na táboa de partidos`);
        }
      }
    }
  });

  it("ningunha elección supera os 350 escanos", () => {
    for (const [year, results] of Object.entries(ELECTION_RESULTS)) {
      const sum = Object.values(results).reduce((a, b) => a + b, 0);
      expect(sum, `suma de ${year}`).toBeLessThanOrEqual(TOTAL_SEATS);
    }
  });

  it("2023 e 2019 (se está cuberto) suman 350", () => {
    for (const year of ["2023", "2019"]) {
      const results = ELECTION_RESULTS[year] ?? {};
      if (Object.keys(results).length === 0) continue;
      const sum = Object.values(results).reduce((a, b) => a + b, 0);
      expect(sum, `suma de ${year}`).toBe(TOTAL_SEATS);
    }
  });
});

describe("ELECTION_GOVERNMENT e ELECTION_ALLIES", () => {
  const ids = new Set(PARTIES.map((p) => p.id));

  it("todas as eleccións referenciadas existen en ELECTION_RESULTS", () => {
    for (const table of [ELECTION_GOVERNMENT, ELECTION_ALLIES]) {
      for (const year of Object.keys(table)) {
        expect(ELECTION_RESULTS[year], `${year} non está en ELECTION_RESULTS`).toBeDefined();
      }
    }
  });

  it("todos os partidos marcados existen na táboa", () => {
    for (const [name, table] of [
      ["goberno", ELECTION_GOVERNMENT],
      ["aliados", ELECTION_ALLIES],
    ] as const) {
      for (const [year, roles] of Object.entries(table)) {
        for (const id of Object.keys(roles)) {
          expect(ids.has(id), `${year}: "${id}" en ${name} non existe`).toBe(true);
        }
      }
    }
  });

  it("ningún partido é a vez goberno e aliado na mesma elección", () => {
    for (const [year, gov] of Object.entries(ELECTION_GOVERNMENT)) {
      const allies = ELECTION_ALLIES[year] ?? {};
      for (const id of Object.keys(gov)) {
        expect(allies[id], `${year}: "${id}" é goberno e aliado á vez`).toBeFalsy();
      }
    }
  });

  it("goberno e aliados teñen escanos > 0 nesa elección", () => {
    for (const table of [ELECTION_GOVERNMENT, ELECTION_ALLIES]) {
      for (const [year, roles] of Object.entries(table)) {
        const results = ELECTION_RESULTS[year] ?? {};
        for (const id of Object.keys(roles)) {
          expect(results[id] ?? 0, `${year}: "${id}" marcado sen escanos`).toBeGreaterThan(0);
        }
      }
    }
  });
});
