"use client";

// ============================================================
// EVENTO DE SESIÓN
// ------------------------------------------------------------
// O layout root non consulta as cookies (así as vistas de só
// lectura /r e /f pódense xerar de forma estática), polo que o
// Header carga o usuario no cliente vía /api/auth/me. Cando un
// compoñente cambia a sesión (AuthForm tras login/rexistro; o
// propio Header tras logout), despacha este evento para que o
// Header recargue o estado sen recargar a páxina.
// ============================================================

export const SESSION_EVENT = "electo:session";

export function notifySessionChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
}
