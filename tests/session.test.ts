import { describe, expect, it } from "vitest";
import { parseSession, sessionToken, SESSION_DAYS } from "@/lib/session";

describe("sesión", () => {
  it("roundtrip: un token válido devolve o id de usuario", () => {
    const token = sessionToken(42);
    expect(parseSession(token)).toBe(42);
  });

  it("rexeita tokens baleiros ou mal formados", () => {
    expect(parseSession(undefined)).toBeNull();
    expect(parseSession("")).toBeNull();
    expect(parseSession("1.2")).toBeNull();
    expect(parseSession("abc.def.ghi")).toBeNull();
  });

  it("rexeita unha sinatura manipulada", () => {
    const token = sessionToken(42);
    const [userId, ts] = token.split(".");
    expect(parseSession(`${userId}.${ts}.sinaturaFalsa`)).toBeNull();
    // Cambiar o id de usuario invalida a sinatura
    expect(parseSession(`99.${ts}.${token.split(".")[2]}`)).toBeNull();
  });

  it("rexeita tokens caducados", () => {
    const antigo = Date.now() - (SESSION_DAYS + 1) * 86_400_000;
    expect(parseSession(sessionToken(42, antigo))).toBeNull();
  });

  it("acepta tokens recentes", () => {
    expect(parseSession(sessionToken(7, Date.now() - 60_000))).toBe(7);
  });
});
