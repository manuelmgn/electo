"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { gl, es, type Dict } from "./dictionaries";

export type Lang = "gl" | "es";

const dicts: Record<Lang, Dict> = { gl, es };

const LANG_KEY = "lang";

// Normaliza o valor gardado (calquera cousa que non sexa "es" → "gl").
export function normalizeLang(value: string | null | undefined): Lang {
  return value === "es" ? "es" : "gl";
}

function readStoredLang(): Lang {
  try {
    return normalizeLang(localStorage.getItem(LANG_KEY));
  } catch {
    return "gl";
  }
}

// Estado compartido: tódolos compoñentes (Header, Editor, vistas de só
// lectura…) len o mesmo idioma. Antes cada useI18n tiña o seu propio
// useState e cambiar o idioma no Header non actualizaba o resto.
let currentLang: Lang = typeof window === "undefined" ? "gl" : readStoredLang();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Lang {
  return currentLang;
}

// No servidor e durante a hidratación empeza en galego; despois
// useSyncExternalStore pasa ao idioma gardado no dispositivo.
function getServerSnapshot(): Lang {
  return "gl";
}

function applyLang(lang: Lang) {
  currentLang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // modo privado sen almacenamento: o idioma vale para esta sesión
  }
  document.documentElement.lang = lang;
  listeners.forEach((listener) => listener());
}

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
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => applyLang(l), []);

  return { t: dicts[lang], lang, setLang };
}
