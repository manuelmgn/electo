import { describe, expect, it } from "vitest";
import {
  PARTIES,
  PARTIES_BY_SEATS,
  PARTIES_BY_AXIS,
  EDITOR_PARTIES,
  PARTY_BY_ID,
  TOTAL_SEATS,
  MAJORITY_SEATS,
  axisValue,
  textOn,
  governmentShade,
  governmentSumColor,
  seatFraction,
  seatPercent,
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

  it("governmentSumColor colorea por rangos de escaños", () => {
    expect(governmentSumColor(200)).toBe(governmentSumColor(176));
    expect(governmentSumColor(175)).not.toBe(governmentSumColor(176));
    expect(governmentSumColor(170)).not.toBe(governmentSumColor(169));
    expect(governmentSumColor(145)).not.toBe(governmentSumColor(144));
    expect(governmentSumColor(130)).not.toBe(governmentSumColor(129));
    expect(governmentSumColor(160)).not.toBe(governmentSumColor(159));
  });
});

describe("tés de orde e axudantes", () => {
  it("PARTIES_BY_AXIS está ordenada de esquerda a dereita", () => {
    for (let i = 1; i < PARTIES_BY_AXIS.length; i++) {
      expect(
        axisValue(PARTIES_BY_AXIS[i - 1]) <= axisValue(PARTIES_BY_AXIS[i])
      ).toBe(true);
    }
  });

  it("PARTIES_BY_AXIS contén os mesmos partidos, cada un unha vez", () => {
    expect(new Set(PARTIES_BY_AXIS.map((p) => p.id)).size).toBe(PARTIES.length);
  });

  it("EDITOR_PARTIES son só os que teñen runs: true", () => {
    expect(EDITOR_PARTIES.every((p) => p.runs)).toBe(true);
    expect(EDITOR_PARTIES.length).toBe(PARTIES.filter((p) => p.runs).length);
  });

  it("PARTY_BY_ID devolve o partido correcto", () => {
    expect(PARTY_BY_ID["pp"].short).toBe("PP");
    expect(PARTY_BY_ID["non-existe"]).toBeUndefined();
  });

  it("seatFraction e seatPercent son consistentes", () => {
    expect(seatFraction(175)).toBe(50);
    expect(seatPercent(87.5)).toBe("25.0%");
    expect(seatPercent(1)).toBe("0.3%");
    expect(seatPercent(0)).toBe("0.0%");
  });
});
