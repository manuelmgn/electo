"use client";

// Avisos emerxentes compartidos (Editor, ResultsView): mesma forma,
// animación e tamaño en toda a app. O centrado úsase para o aviso de
// copia da ligazón (verde azulado / laranxa) e o inferior para os
// erros (granate).

// Aviso centrado na ventana visible, sobre todo o contido.
export function CenterToast({
  children,
  background,
}: {
  children: React.ReactNode;
  background: string;
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="anim-toast mx-4 max-w-[calc(100vw-2rem)] rounded-2xl px-7 py-3 text-center text-sm font-semibold shadow-xl"
        style={{ background, color: "#ffffff" }}
        role="status"
      >
        {children}
      </div>
    </div>
  );
}

// Aviso de erro, abaixo centrado sobre a vista.
export function BottomToast({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 z-50"
      style={{ transform: "translateX(-50%)" }}
    >
      <div
        className="anim-toast mx-4 max-w-[calc(100vw-2rem)] rounded-2xl px-7 py-3 text-center text-sm font-semibold shadow-xl"
        style={{ background: "var(--error)", color: "#ffffff" }}
        role="status"
      >
        {children}
      </div>
    </div>
  );
}
