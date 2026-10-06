import { describe, expect, it } from "vitest";
import {
  PARTIES,
  PARTIES_BY_SEATS,
  TOTAL_SEATS,
  MAJORITY_SEATS,
  axisValue,
  textOn,
  governmentShade,
} from "@/lib/parties";

describe("parties", () => {
  it("os ids son únicos", () => {
    const ids = PARTIES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("axisValue limita o valor entre -3 e 3", () => {
    expect(axisValue({ axis: -9 } as never)).toBe(-3);
    expect(axisValue({ axis: 9 } as never)).toBe(3);
    expect(axisValue({ axis: 0 } as never)).toBe(0);
  });

  it("PARTIES_BY_SEATS está ordenada por escaños descendente", () => {
    for (let i = 1; i < PARTIES_BY_SEATS.length; i++) {
      expect(PARTIES_BY_SEATS[i - 1].seats).toBeGreaterThanOrEqual(
        PARTIES_BY_SEATS[i].seats
      );
    }
  });

  it("PARTIES_BY_SEATS contén os mesmos partidos", () => {
    expect(PARTIES_BY_SEATS.length).toBe(PARTIES.length);
  });

  it("textOn elixe contraste lexible", () => {
    expect(textOn("#000000")).toBe("#ffffff");
    expect(textOn("#FFFFFF")).toBe("#1a1a1a");
  });

  it("maioría absoluta = metade máis un", () => {
    expect(MAJORITY_SEATS).toBe(TOTAL_SEATS / 2 + 1);
  });

  it("governmentShade asigna tonalidades de verde distintas por rango", () => {
    const first = governmentShade(0, 2);
    const second = governmentShade(1, 2);
    expect(first).toMatch(/^hsl\(145, 60%, \d+%\)$/);
    expect(second).not.toBe(first);
  });

  it("governmentShade aclara a un paso fixo e limita a claridade", () => {
    // Con 2 socios o segundo só aclara un paso suave.
    expect(governmentShade(1, 2)).toBe("hsl(145, 60%, 34%)");
    expect(governmentShade(0, 5)).toBe("hsl(145, 60%, 28%)");
    expect(governmentShade(4, 5)).toBe("hsl(145, 60%, 52%)");
    // Máis aló do quinto socio non aclara máis.
    expect(governmentShade(8, 9)).toBe(governmentShade(4, 5));
  });
});
