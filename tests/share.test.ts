import { describe, expect, it } from "vitest";
import { buildShareLines, decodeShare, encodeShare } from "@/lib/share";

describe("share", () => {
  it("codifica e descodifica sen perder datos", () => {
    const seats = { pp: 137, psoe: 121, vox: 33 };
    const governs = { pp: true };
    const allies = { pnv: true };
    expect(decodeShare(encodeShare(seats, governs, allies))).toEqual({
      v: 1,
      seats,
      governs,
      allies,
    });
  });

  it("omite escaños a 0 e marcas a false", () => {
    const code = encodeShare(
      { pp: 100, psoe: 0 },
      { pp: true, psoe: false },
      { pp: false, psoe: true }
    );
    expect(decodeShare(code)).toEqual({
      v: 1,
      seats: { pp: 100 },
      governs: { pp: true },
      allies: { psoe: true },
    });
  });

  it("acepta ligazóns antigas sen aliados", () => {
    const code = encodeShare({ pp: 100 }, { pp: true }, {});
    // Simula unha ligazón v1 sen campo allies recortándoo do JSON.
    const raw = JSON.parse(atob(code.replace(/-/g, "+").replace(/_/g, "/")));
    delete raw.allies;
    const legacy = btoa(JSON.stringify(raw))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(decodeShare(legacy)).toEqual({
      v: 1,
      seats: { pp: 100 },
      governs: { pp: true },
      allies: {},
    });
  });

  it("o código é seguro para URL (base64url)", () => {
    expect(encodeShare({ vv: 350 }, {}, {})).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("devolve null con códigos inválidos", () => {
    expect(decodeShare("")).toBeNull();
    expect(decodeShare("!!!")).toBeNull();
    expect(decodeShare("aGVsbG8")).toBeNull(); // JSON válido sen campo seats
  });
});

describe("buildShareLines", () => {
  const parties = [
    { id: "pp", short: "PP", emoji: "💧" },
    { id: "psoe", short: "PSOE", emoji: "🌹" },
    { id: "vox", short: "Vox", emoji: "🥦" },
    { id: "fa", short: "FA", emoji: "🌸" },
    { id: "pnv", short: "PNV", emoji: "🍇" },
  ];

  it("lista os 4 máis votados cos seus emojis e escaños", () => {
    const seats = { pp: 130, psoe: 120, vox: 30, fa: 25, pnv: 5 };
    expect(buildShareLines(seats, {}, {}, parties)).toEqual([
      "💧 PP   - 130",
      "🌹 PSOE - 120",
      "🥦 Vox  - 30 ",
      "🌸 FA   - 25 ",
    ]);
  });

  it("engade 🏛️ e 🤝 aos partidos marcados", () => {
    const seats = { pp: 130, psoe: 120, vox: 30, fa: 25 };
    expect(
      buildShareLines(seats, { pp: true, vox: true }, { psoe: true }, parties)
    ).toEqual([
      "💧 PP   - 130 - 🏛️",
      "🌹 PSOE - 120 - 🤝",
      "🥦 Vox  - 30  - 🏛️",
      "🌸 FA   - 25 ",
    ]);
  });

  it("inclúe un gobernante ou aliado aínda que non estea no top 4", () => {
    const seats = { pp: 130, psoe: 120, vox: 30, fa: 25, pnv: 5 };
    const govLines = buildShareLines(seats, { pnv: true }, {}, parties);
    expect(govLines).toHaveLength(5);
    expect(govLines[4]).toBe("🍇 PNV  - 5   - 🏛️");
    const allyLines = buildShareLines(seats, {}, { pnv: true }, parties);
    expect(allyLines).toHaveLength(5);
    expect(allyLines[4]).toBe("🍇 PNV  - 5   - 🤝");
  });

  it("ignora partidos con 0 escaños", () => {
    expect(buildShareLines({ pp: 0, psoe: 121 }, {}, {}, parties)).toEqual([
      "🌹 PSOE - 121",
    ]);
  });
});
