import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

// Devolve o usuario da sesión (ou null) para o Header, que vive
// cliente: o layout root é estático e non consulta as cookies.
export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user: user ? { name: user.name } : null });
}
