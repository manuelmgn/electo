import { describe, it, expect } from "vitest";
import {
  slugifyKey,
  ELECTION_VIEWS,
  FORECAST_VIEWS,
  getElectionView,
  getForecastView,
} from "@/lib/views";

describe("slugifyKey", () => {
  it("converte as claves reais das eleccións", () => {
    expect(slugifyKey("2023")).toBe("2023");
    expect(slugifyKey("2019 (I)")).toBe("2019-i");
    expect(slugifyKey("2019 (II)")).toBe("2019-ii");
  });

  it("quita acentos e caracteres especiais (CIS-Electomanía)", () => {
    expect(slugifyKey("2026-09 (CIS-Electomanía)")).toBe(
      "2026-09-cis-electomania"
    );
    expect(slugifyKey("2026-09 (Celeste Tel)")).toBe("2026-09-celeste-tel");
  });

  it("colapsa secuencias non alfanuméricas nun só guión", () => {
    expect(slugifyKey("  Foo -- Bar!! ")).toBe("foo-bar");
  });
});

describe("vistas de resultados e pronósticos", () => {
  it("os slugs son únicos en cada táboa", () => {
    const electionKeys = Object.keys(ELECTION_VIEWS);
    expect(new Set(electionKeys).size).toBe(electionKeys.length);
    const forecastKeys = Object.keys(FORECAST_VIEWS);
    expect(new Set(forecastKeys).size).toBe(forecastKeys.length);
  });

  it("cada vista conserva a clave orixinal e os seus datos", () => {
    const v2023 = getElectionView("2023");
    expect(v2023).not.toBeNull();
    expect(v2023!.key).toBe("2023");
    expect(v2023!.seats).toEqual(expect.objectContaining({ pp: 137, psoe: 121 }));
    expect(v2023!.government).toEqual({ psoe: true, s: true });
    expect(v2023!.allies).toEqual(
      expect.objectContaining({ erc: true, pnv: true })
    );
  });

  it("os pronósticos non publicados non teñen vista", () => {
    const published = Object.values(FORECAST_VIEWS).map((v) => v.key);
    expect(published).toContain("2026-09 (CIS-Electomanía)");
    expect(getForecastView("2026-09-cis-electomania")).not.toBeNull();
    expect(getForecastView("")).toBeNull();
  });

  it("slug descoñecido devolve null", () => {
    expect(getElectionView("1999")).toBeNull();
    expect(getForecastView("nin-gunha-cousa")).toBeNull();
  });
});
