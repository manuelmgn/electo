import { describe, expect, it } from "vitest";
import {
  errorMessage,
  dateLocale,
  formatDate,
  normalizeLang,
} from "@/lib/i18n";
import { gl, es } from "@/lib/dictionaries";

describe("errorMessage", () => {
  it("traduce claves coñecidas de erro", () => {
    expect(errorMessage(gl, "need-login")).toBe(gl["need-login"]);
    expect(errorMessage(es, "email-used")).toBe(es["email-used"]);
  });

  it("fallback a mensaxe xenérica con claves descoñecidas", () => {
    expect(errorMessage(gl, "non-existe")).toBe(gl.errorGeneric);
    expect(errorMessage(gl, null)).toBe(gl.errorGeneric);
    expect(errorMessage(es, 42)).toBe(es.errorGeneric);
  });
});

describe("normalizeLang", () => {
  it("acepta só «es» e cae en galego no resto", () => {
    expect(normalizeLang("es")).toBe("es");
    expect(normalizeLang("gl")).toBe("gl");
    expect(normalizeLang(null)).toBe("gl");
    expect(normalizeLang("fr")).toBe("gl");
  });
});

describe("datas", () => {
  it("dateLocale segundo o idioma", () => {
    expect(dateLocale("gl")).toBe("gl-ES");
    expect(dateLocale("es")).toBe("es-ES");
  });

  it("formatDate devolve a data curta", () => {
    // Mes e día fixos para non depender da zona horaria dos fusos.
    const d = "2026-01-02T00:00:00.000Z";
    expect(formatDate(d, "es").length).toBeGreaterThan(0);
    expect(formatDate(d, "gl").length).toBeGreaterThan(0);
  });
});
