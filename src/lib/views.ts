// ============================================================
// VISTAS DE SÓ LECTURA CON LIGAZÓN PROPIA
// ------------------------------------------------------------
// Constrúe unha entrada compartíbel para cada resultado electoral
// anterior e cada pronóstico publicado. Cada entrada ten un slug
// breve derivado da clave da táboa ("2019 (II)" → "2019-ii",
// "2026-09 (CIS-Electomanía)" → "2026-09-cis-electomania"), que é
// o que vai na URL das rutas /r/[slug] e /f/[slug]. As táboas de
// orixe (results.ts, forecasts.ts) non se tocan: seguen sendo as
// únicas para editar datos.
// ============================================================

import {
  ELECTION_RESULTS,
  ELECTION_GOVERNMENT,
  ELECTION_ALLIES,
} from "./results";
import { FORECASTS } from "./forecasts";

export type ReadonlyView = {
  slug: string;
  key: string;
  seats: Record<string, number>;
  government: Record<string, boolean>;
  allies: Record<string, boolean>;
};

// Converte unha clave da táboa nun slug de URL: minúsculas sen
// acentos (NFD + marcas combinantes fora) e calquera secuencia
// non alfanumérica reducida a un único guión.
export function slugifyKey(key: string): string {
  return key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildViews(
  entries: Record<string, Record<string, number>>,
  governmentOf: (key: string) => Record<string, boolean>,
  alliesOf: (key: string) => Record<string, boolean>
): Record<string, ReadonlyView> {
  return Object.fromEntries(
    Object.keys(entries)
      .filter((k) => Object.keys(entries[k]).length > 0)
      .map((k) => [
        slugifyKey(k),
        {
          slug: slugifyKey(k),
          key: k,
          seats: entries[k],
          government: governmentOf(k),
          allies: alliesOf(k),
        },
      ])
  );
}

export const ELECTION_VIEWS: Record<string, ReadonlyView> = buildViews(
  ELECTION_RESULTS,
  (k) => ELECTION_GOVERNMENT[k] ?? {},
  (k) => ELECTION_ALLIES[k] ?? {}
);

// Só os pronósticos marcados como publicados entran nas vistas
// (os demais quedan no código pero non teñen URL propia).
export const FORECAST_VIEWS: Record<string, ReadonlyView> = buildViews(
  Object.fromEntries(
    Object.entries(FORECASTS)
      .filter(([, f]) => f.published)
      .map(([k, f]) => [k, f.seats])
  ),
  (k) => FORECASTS[k]?.government ?? {},
  (k) => FORECASTS[k]?.allies ?? {}
);

export function getElectionView(slug: string): ReadonlyView | null {
  return ELECTION_VIEWS[slug] ?? null;
}

export function getForecastView(slug: string): ReadonlyView | null {
  return FORECAST_VIEWS[slug] ?? null;
}

// Resumo dunha vista para a descrición dos metadatos: os 3 partidos
// con máis escaños coas súas siglas ("PP 137 · PSOE 121 · Vox 33").
// Necesita as siglas, así que recibe a táboa de partidos (parties.ts).
export function viewSummary(
  view: ReadonlyView,
  parties: { id: string; short: string }[]
): string {
  return Object.entries(view.seats)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([id, n]) => {
      const short = parties.find((p) => p.id === id)?.short ?? id;
      return `${short} ${n}`;
    })
    .join(" · ");
}
