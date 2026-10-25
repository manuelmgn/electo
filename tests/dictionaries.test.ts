import { describe, expect, it } from "vitest";
import { gl, es } from "@/lib/dictionaries";
import { jsonbObject } from "@/lib/jsonb";

describe("dicionarios", () => {
  it("gl e es teñen exactamente as mesmas claves", () => {
    expect(Object.keys(gl).sort()).toEqual(Object.keys(es).sort());
  });

  it("ningunha cadea queda baleira", () => {
    for (const dict of [gl, es]) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value.trim().length, `clave "${key}" baleira`).toBeGreaterThan(0);
      }
    }
  });
});

describe("jsonbObject", () => {
  it("parsea cadeas JSON", () => {
    expect(jsonbObject('{"a":1}')).toEqual({ a: 1 });
  });

  it("devolve os obxectos tal cal", () => {
    const obj = { b: true };
    expect(jsonbObject(obj)).toBe(obj);
  });

  it("fallback a obxecto baleiro con entradas inválidas", () => {
    expect(jsonbObject("non-e-json")).toEqual({});
    expect(jsonbObject(null)).toEqual({});
    expect(jsonbObject(42)).toEqual({});
  });
});
