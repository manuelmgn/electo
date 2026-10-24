import { describe, expect, it } from "vitest";
import { FORECASTS } from "@/lib/forecasts";
import { PARTIES, TOTAL_SEATS } from "@/lib/parties";

// Comprobacións de sanitidade da táboa de pronósticos, simétricas ás
// que hai para ELECTION_RESULTS en predictions.test.ts.

describe("FORECASTS", () => {
  const ids = new Set(PARTIES.map((p) => p.id));

  it("tódolos partidos referenciados existen na táboa de partidos", () => {
    for (const [key, forecast] of Object.entries(FORECASTS)) {
      for (const id of Object.keys(forecast.seats)) {
        expect(
          ids.has(id),
          `${key}: "${id}" non está na táboa de partidos`
        ).toBe(true);
      }
    }
  });

  it("ningún pronóstico supera os 350 escaños", () => {
    for (const [key, forecast] of Object.entries(FORECASTS)) {
      const sum = Object.values(forecast.seats).reduce((a, b) => a + b, 0);
      expect(sum, `suma de ${key}`).toBeLessThanOrEqual(TOTAL_SEATS);
    }
  });

  it("ningún partido é á vez goberno e aliado", () => {
    for (const [key, forecast] of Object.entries(FORECASTS)) {
      for (const id of Object.keys(forecast.government)) {
        expect(
          forecast.allies[id],
          `${key}: "${id}" é goberno e aliado á vez`
        ).toBeFalsy();
      }
    }
  });

  it("goberno e aliados teñen escaños > 0 nese pronóstico", () => {
    for (const [key, forecast] of Object.entries(FORECASTS)) {
      for (const table of [forecast.government, forecast.allies]) {
        for (const id of Object.keys(table)) {
          expect(
            forecast.seats[id] ?? 0,
            `${key}: "${id}" marcado sen escaños`
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it("tódolos bloques teñen seats con contido (sen bloques baleiros)", () => {
    for (const [key, forecast] of Object.entries(FORECASTS)) {
      expect(
        Object.keys(forecast.seats).length,
        `${key}: bloque baleiro (non se amosaría nunca)`
      ).toBeGreaterThan(0);
    }
  });
});
