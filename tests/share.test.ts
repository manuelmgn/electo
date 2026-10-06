import { describe, expect, it } from "vitest";
import { decodeShare, encodeShare } from "@/lib/share";

describe("share", () => {
  it("codifica e descodifica sen perder datos", () => {
    const seats = { pp: 137, psoe: 121, vox: 33 };
    const governs = { pp: true };
    expect(decodeShare(encodeShare(seats, governs))).toEqual({
      v: 1,
      seats,
      governs,
    });
  });

  it("omite escaños a 0 e goberno a false", () => {
    const code = encodeShare({ pp: 100, psoe: 0 }, { pp: true, psoe: false });
    expect(decodeShare(code)).toEqual({ v: 1, seats: { pp: 100 }, governs: { pp: true } });
  });

  it("o código é seguro para URL (base64url)", () => {
    expect(encodeShare({ vv: 350 }, {})).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("devolve null con códigos inválidos", () => {
    expect(decodeShare("")).toBeNull();
    expect(decodeShare("!!!")).toBeNull();
    expect(decodeShare("aGVsbG8")).toBeNull(); // JSON válido sen campo seats
  });
});
