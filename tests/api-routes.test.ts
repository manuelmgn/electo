import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// ============================================================
// TESTS DE INTEGRACIÓN DAS RUTAS API
// ------------------------------------------------------------
// Móckase @/lib/db cun cliente SQL falso (registra as consultas,
// devolve filas da cola e pode lanzar erros encolados) e @/lib/auth
// cunha sesión fixa. Así proban as rutas completa: validación,
// autorización e chamadas SQL, sen base de datos real.
// ============================================================

const h = vi.hoisted(() => {
  type Call = { query: string; params: unknown[] };
  type Rule = { re: RegExp; rows: unknown[] };
  const calls: Call[] = [];
  const returning: unknown[][] = [];
  const errors: unknown[] = [];
  // Regras por contido da consulta, para cando a cola por orde non
  // basta (SELECT e INSERT solapados na mesma petición).
  const rules: Rule[] = [];

  type SqlFn = ((
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => Promise<unknown[]>) & {
    begin: (cb: (tx: SqlFn) => unknown) => Promise<unknown>;
  };

  // Obxecto SQL: callable coma tagged template + .begin() con
  // transacción que comparte as mesmas colas.
  function makeSql(label: string): SqlFn {
    const fn = (strings: TemplateStringsArray, ...values: unknown[]) => {
      const query = strings[0] ?? "";
      calls.push({ query, params: [label, ...values] });
      if (errors.length > 0) throw errors.shift();
      if (returning.length > 0) return Promise.resolve(returning.shift());
      const rule = rules.find((r) => r.re.test(query));
      return Promise.resolve(rule ? rule.rows : []);
    };
    const sql = fn as SqlFn;
    sql.begin = async (cb) => cb(makeSql(`${label}:tx`));
    return sql;
  }

  return {
    sql: makeSql("db"),
    calls,
    returning,
    errors,
    rules,
    // Usuario que devolve o getSessionUser simulado (null = sen sesión).
    sessionUser: null as { id: number } | null,
  };
});

vi.mock("@/lib/db", () => ({
  dbConfigured: () => Boolean(process.env.POSTGRES_URL),
  sql: h.sql,
}));

vi.mock("@/lib/auth", () => ({
  getSessionUser: async () => h.sessionUser,
  setSessionCookie: vi.fn(),
  clearSessionCookie: vi.fn(),
  SESSION_COOKIE: "electo_session",
}));

const prevUrl = process.env.POSTGRES_URL;

beforeAll(() => {
  process.env.POSTGRES_URL = "postgres://test:test@localhost/test";
});

afterAll(() => {
  if (prevUrl === undefined) delete process.env.POSTGRES_URL;
  else process.env.POSTGRES_URL = prevUrl;
});

// Consultas SELECT...RETURNING/INSERT...RETURNING devolven da cola
// por orde; vermell: o rexistro está en h.calls.
const jsonReq = (body: unknown): Request =>
  new Request("http://localhost/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const seats350 = { pp: 137, psoe: 121, vox: 33, s: 31, upn: 1, cc: 1, bng: 26 };

// Converte o módulo da ruta ao tipo esperado polas chamadas dos
// tests (Request, ctx → Response).
type RouteModule = Record<
  string,
  (req: Request, ctx?: { params: Promise<Record<string, string>> }) => Promise<Response>
>;

function api(mod: unknown): RouteModule {
  return mod as RouteModule;
}

describe("POST /api/predictions", () => {
  it("401 sen sesión", async () => {
    const { POST } = await import("@/app/api/predictions/route");
    const res = await api({ POST }).POST(jsonReq({ seats: seats350 }));
    expect(res.status).toBe(401);
    expect((await res.json()).message).toBe("need-login");
  });

  it("500 sen base de datos configurada", async () => {
    process.env.POSTGRES_URL = "";
    const { POST } = await import("@/app/api/predictions/route");
    const res = await api({ POST }).POST(jsonReq({ seats: seats350 }));
    expect(res.status).toBe(500);
    expect((await res.json()).message).toBe("no-db");
    process.env.POSTGRES_URL = "postgres://test:test@localhost/test";
  });

  it("400 con corpo non JSON", async () => {
    h.sessionUser = { id: 1 };
    const { POST } = await import("@/app/api/predictions/route");
    const req = new Request("http://localhost/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "isto-non-e-json",
    });
    const res = await api({ POST }).POST(req);
    expect(res.status).toBe(400);
  });

  it("400 se a suma non é 350", async () => {
    const { POST } = await import("@/app/api/predictions/route");
    const res = await api({ POST }).POST(
      jsonReq({ seats: { pp: 100 } })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).message).toBe("invalid-data");
  });

  it("garda predición + escaños nunha transacción", async () => {
    const { POST } = await import("@/app/api/predictions/route");
    h.calls.length = 0;
    h.returning.push([{ id: 55 }]); // INSERT ... RETURNING id
    const res = await api({ POST }).POST(
      jsonReq({ title: "  Proba  ", seats: seats350 })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 55 });
    const queries = h.calls.map((c) => c.query);
    expect(queries.some((q) => q.includes("INSERT INTO predictions"))).toBe(true);
    expect(queries.some((q) => q.includes("INSERT INTO prediction_seats"))).toBe(true);
    // O título manda recortado e limpo
    const insertTitle = h.calls.find((c) => c.query.includes("INSERT INTO predictions"));
    expect(insertTitle?.params).toContain("Proba");
  });
});

describe("PUT/DELETE /api/predictions/[id]", () => {
  const ctx = { params: Promise.resolve({ id: "7" }) };

  it("PUT 404 se a predición non é do usuario", async () => {
    const mod = await import("@/app/api/predictions/[id]/route");
    h.sessionUser = { id: 1 };
    h.returning.push([]); // ownsPrediction: sen filas → non é seu
    const res = await api(mod).PUT(
      jsonReq({ title: "x", seats: seats350 }),
      ctx
    );
    expect(res.status).toBe(404);
  });

  it("PUT reescribe escaños e título", async () => {
    const mod = await import("@/app/api/predictions/[id]/route");
    h.calls.length = 0;
    h.returning.push([{ id: 1 }]); // ownsPrediction: é seu
    const res = await api(mod).PUT(
      jsonReq({ title: "Novo título", seats: seats350 }),
      ctx
    );
    expect(res.status).toBe(200);
    const queries = h.calls.map((c) => c.query);
    expect(queries.some((q) => q.includes("DELETE FROM prediction_seats"))).toBe(true);
    expect(queries.some((q) => q.includes("INSERT INTO prediction_seats"))).toBe(true);
    expect(queries.some((q) => q.includes("UPDATE predictions"))).toBe(true);
  });

  it("PUT 400 con reparto inválido", async () => {
    const mod = await import("@/app/api/predictions/[id]/route");
    h.returning.push([{ id: 1 }]);
    const res = await api(mod).PUT(
      jsonReq({ title: "x", seats: { pp: 349, psoe: 1, vox: 0.5 } }),
      ctx
    );
    expect(res.status).toBe(400);
  });

  it("DELETE elimina a predición propia", async () => {
    const mod = await import("@/app/api/predictions/[id]/route");
    h.calls.length = 0;
    h.returning.push([{ id: 1 }]);
    const res = await api(mod).DELETE(
      new Request("http://localhost/test", { method: "DELETE" }),
      ctx
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(h.calls.some((c) => c.query.includes("DELETE FROM predictions"))).toBe(true);
    // id non enteiro → 404 sen tocar BD
    h.calls.length = 0;
    const badCtx = { params: Promise.resolve({ id: "abc" }) };
    const res2 = await api(mod).DELETE(
      new Request("http://localhost/test", { method: "DELETE" }),
      badCtx
    );
    expect(res2.status).toBe(404);
    expect(h.calls.some((c) => c.query.includes("DELETE FROM predictions"))).toBe(false);
  });
});

describe("POST /api/share", () => {
  it("crea un código de 20 caracteres", async () => {
    const { POST } = await import("@/app/api/share/route");
    h.calls.length = 0;
    const res = await api({ POST }).POST(
      jsonReq({ title: "Semana", seats: seats350, governs: { pp: true, "non": true }, allies: { s: true } })
    );
    expect(res.status).toBe(200);
    const { code } = await res.json();
    expect(code).toMatch(/^[A-Za-z0-9]{20}$/);
    expect(h.calls.filter((c) => c.query.includes("shared_predictions"))).toHaveLength(1);
  });

  it("reintenta ante colisión de código (23505)", async () => {
    const { POST } = await import("@/app/api/share/route");
    h.calls.length = 0;
    h.errors.push(Object.assign(new Error("dup"), { code: "23505" }));
    const res = await api({ POST }).POST(
      jsonReq({ seats: seats350 })
    );
    expect(res.status).toBe(200);
    expect(h.calls.filter((c) => c.query.includes("shared_predictions"))).toHaveLength(2);
  });

  it("400 con reparto inválido", async () => {
    const { POST } = await import("@/app/api/share/route");
    const res = await api({ POST }).POST(
      jsonReq({ seats: { pp: 350, psoe: 5 } })
    );
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login e rexistro", () => {
  it("401 con credenciais de usuario inexistente (hash a-tempo-uniforme)", async () => {
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await api({ POST }).POST(
      jsonReq({ email: "quente@exemplo.gal", password: "contrasinal-errado" })
    );
    expect(res.status).toBe(401);
    expect((await res.json()).message).toBe("bad-credentials");
  });

  it("rexistro crea usuario e devolve datos", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    h.calls.length = 0;
    h.returning.length = 0;
    // O SELECT de comprobación devolve [] (regra por defecto); o
    // INSERT ... RETURNING responde coa regra por contido de consulta.
    h.rules.length = 0;
    h.rules.push({
      re: /INSERT INTO users/,
      rows: [{ id: 9, name: "Ana", email: "novo@exemplo.gal" }],
    });
    const res = await api({ POST }).POST(
      jsonReq({ name: "Ana", email: "novo@exemplo.gal", password: "contrasinal123" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user).toEqual({ id: 9, name: "Ana", email: "novo@exemplo.gal" });
    const queries = h.calls.map((c) => c.query);
    expect(queries.some((q) => q.includes("SELECT 1 FROM users"))).toBe(true);
    expect(queries.some((q) => q.includes("INSERT INTO users"))).toBe(true);
    h.rules.length = 0;
  });

  it("rexistro 409 se o correo xa existe", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    h.returning.push([{ id: 1 }]); // SELECT 1 FROM users devolve fila
    const res = await api({ POST }).POST(
      jsonReq({ name: "A", email: "existe@exemplo.gal", password: "contrasinal123" })
    );
    expect(res.status).toBe(409);
    expect((await res.json()).message).toBe("email-used");
  });

  it("rexistro 400 con contrasinal curto", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await api({ POST }).POST(
      jsonReq({ name: "A", email: "a@exemplo.gal", password: "curta" })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).message).toBe("short-password");
  });
});
