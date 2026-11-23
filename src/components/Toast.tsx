"use client";

import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Avisos emerxentes compartidos (Editor, ResultsView): mesma forma,
// animación e tamaño en toda a app. O centrado úsase para o aviso de
// copia da ligazón (verde azulado / laranxa) e o inferior para os
// erros (granate).
//
// Móntanse con createPortal sobre document.body e promóvense á Top Layer
// con popover="manual" (se o navegador o soporta) para escapar dos
// contedores con animacións/transformacións (ex. .anim-fade-up), que en
// móbil/WebKit converten `position: fixed` en relativo á páxina enteira
// en vez de á pantalla visible.

function useManualPopover() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof el.showPopover !== "function") return;
    try {
      el.showPopover();
    } catch {
      // Xa aberto ou non conectado ao DOM
    }
    return () => {
      try {
        if (el.matches(":popover-open")) el.hidePopover();
      } catch {
        // Ignorar ao desmontar
      }
    };
  }, []);

  return ref;
}

// Aviso centrado na pantalla visible, sobre todo o contido.
export function CenterToast({
  children,
  background,
}: {
  children: React.ReactNode;
  background: string;
}) {
  const ref = useManualPopover();
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={ref}
      popover="manual"
      className="pointer-events-none fixed inset-0 z-50 m-0 flex h-full w-full max-h-none max-w-none items-center justify-center overflow-visible border-0 bg-transparent p-0"
    >
      <div
        className="anim-toast mx-4 max-w-[calc(100vw-2rem)] rounded-2xl px-7 py-3 text-center text-sm font-semibold shadow-xl"
        style={{ background, color: "#ffffff" }}
        role="status"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

// Aviso de erro, abaixo centrado na pantalla visible.
export function BottomToast({ children }: { children: React.ReactNode }) {
  const ref = useManualPopover();
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={ref}
      popover="manual"
      className="pointer-events-none fixed inset-x-0 bottom-6 top-auto z-50 m-0 flex w-full max-w-none justify-center overflow-visible border-0 bg-transparent p-0"
    >
      <div
        className="anim-toast mx-4 max-w-[calc(100vw-2rem)] rounded-2xl px-7 py-3 text-center text-sm font-semibold shadow-xl"
        style={{ background: "var(--error)", color: "#ffffff" }}
        role="alert"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
