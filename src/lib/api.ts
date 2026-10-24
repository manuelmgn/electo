import { NextResponse } from "next/server";
import { dbConfigured } from "./db";

// ============================================================
// AXUDANTES DAS RUTAS API
// ------------------------------------------------------------
// Comportamento común a tódalas rutas: comprobación da base de
// datos e parseo seguro do corpo JSON (sempre un obxecto ou null;
// nunca lanza, para non deixar rutas sen resposta).
// ============================================================

// Comproba se hai base de datos configurada. Se a hai, devolve null;
// non, unha resposta de erro lista para devolver.
export function requireDb(): NextResponse | null {
  return dbConfigured()
    ? null
    : NextResponse.json({ message: "no-db" }, { status: 500 });
}

// Le o corpo JSON da petición. Devolve null se non é un obxecto
// JSON válido (non se lanza: tódalas rutas responden 400 igual).
export async function readJson<T extends object>(req: Request): Promise<T | null> {
  try {
    const body = await req.json();
    return typeof body === "object" && body !== null && !Array.isArray(body)
      ? (body as T)
      : null;
  } catch {
    return null;
  }
}
