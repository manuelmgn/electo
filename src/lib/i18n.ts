"use client";

import { useCallback, useEffect, useState } from "react";
import { gl, es, type Dict } from "./dictionaries";

export type Lang = "gl" | "es";

const dicts: Record<Lang, Dict> = { gl, es };

// Traduce unha clave de erro vinda da API; fallback a mensaxe xenérica.
export function errorMessage(t: Dict, key: unknown): string {
  if (typeof key === "string" && key in t) {
    return t[key as keyof Dict];
  }
  return t.errorGeneric;
}

export function useI18n() {
  const [lang, setLangState] = useState<Lang>("gl");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    const l: Lang = saved === "es" ? "es" : "gl";
    setLangState(l);
    document.documentElement.lang = l;
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
    document.documentElement.lang = l;
  }, []);

  return { t: dicts[lang], lang, setLang };
}
