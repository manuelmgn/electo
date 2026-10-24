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

// Locale de data segundo o idioma activo ("gl-ES" | "es-ES"). Úsase
// en tódalas datas expostas na interface.
export function dateLocale(lang: Lang): string {
  return lang === "gl" ? "gl-ES" : "es-ES";
}

// Data curta (28/05/2026) na idioma activo, para tarxetas e listaxes.
export function formatDate(date: Date | string, lang: Lang): string {
  return new Date(date).toLocaleDateString(dateLocale(lang));
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
