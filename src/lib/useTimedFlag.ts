"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Aviso temporal xenérico: garda un valor (mesaxe/variante) durante
// `durationMs` e limpa o temporizador anterior se se volve disparar.
// Elimina a repetición de refs de timer nos componentes (Editor:
// toast + aviso de copia; ResultsView: aviso de copia).
export function useTimedFlag<T extends string>(
  durationMs: number
): {
  value: T | null;
  fire: (value: T) => void;
  clear: () => void;
} {
  const [value, setValue] = useState<T | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    []
  );

  const fire = useCallback(
    (next: T) => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      setValue(next);
      timer.current = window.setTimeout(() => setValue(null), durationMs);
    },
    [durationMs]
  );

  const clear = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setValue(null);
  }, []);

  return { value, fire, clear };
}
