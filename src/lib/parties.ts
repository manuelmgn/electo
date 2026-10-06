// ============================================================
// TÁBOA DE PARTIDOS — EDITA AQUÍ
// ------------------------------------------------------------
// Podes engadir, quitar ou modificar partidos libremente.
// - id:      identificador único e estable (NON o cambies se xa
//            hai predicicións gardadas na base de datos).
// - name:    nome oficial do partido.
// - short:   siglas que se amosan na interface.
// - color:   cor en hexadecimal (3 ou 6 díxitos).
// - logo:    nome do ficheiro do logo dentro de /public/logos/
//            (se o ficheiro non existe, móstrase o chip de cor
//            coas siglas no seu lugar).
// - runs:    se o partido se presenta ás eleccións (true) ou non
//            (false). Os desactivados non aparecen no editor.
// - axis:    posición no eixo esquerda-dereita, enteiro entre
//            -3 (esquerda) e 3 (dereita). Determina a posición
//            do partido no hemiciclo e na barra: a maior valor,
//            máis á dereita. Se dous partidos empatan, mántense
//            na orde da lista.
// ============================================================

import { ELECTION_RESULTS } from "./results";

export type Party = {
  id: string;
  name: string;
  short: string;
  color: string;
  logo: string;
  axis: number;
  runs: boolean;
};

export const TOTAL_SEATS = 350;

export const PARTIES: Party[] = [
  { id: "pp",      name: "Partido Popular",                                  short: "PP",    color: "#0B5FA5", logo: "pp.png",     axis: 2, runs: true },
  { id: "psoe",    name: "Partido Socialista Obrero Español",                short: "PSOE",  color: "#E30613", logo: "psoe.png",   axis: -1, runs: true },
  { id: "vox",     name: "Vox",                                              short: "Vox",   color: "#5AC035", logo: "vox.png",    axis: 3, runs: true },
  { id: "fe",      name: "Frente Amplio",                                    short: "FE",    color: "#EC407A", logo: "fa.png",     axis: -2, runs: true },
  { id: "jxc",     name: "Junts per Catalunya",                              short: "JxC",   color: "#00C1B1", logo: "jxc.png",    axis: 1, runs: true },
  { id: "erc",     name: "Esquerra Republicana de Catalunya",                short: "ERC",   color: "#F9B233", logo: "erc.png",    axis: -2, runs: true },
  { id: "ehb",     name: "EH Bildu",                                         short: "EHB",   color: "#0BCFB5", logo: "ehb.jpg",    axis: -2, runs: true },
  { id: "pnv",     name: "Partido Nacionalista Vasco",                       short: "PNV",   color: "#0E6E4E", logo: "pnv.png",    axis: 1, runs: true },
  { id: "podemos", name: "Podemos",                                          short: "P.",    color: "#7D3C98", logo: "podemos.png",axis: -3, runs: true },
  { id: "bng",     name: "Bloque Nacionalista Galego",                       short: "BNG",   color: "#7FC4E8", logo: "bng.png",    axis: -2, runs: true },
  { id: "upn",     name: "Unión del Pueblo Navarro",                         short: "UPN",   color: "#3A5FBD", logo: "upn.jpg",    axis: 2, runs: true },
  { id: "cc",      name: "Coalición Canaria",                                short: "CC",    color: "#FFCE00", logo: "cc.png",     axis: 1, runs: true },
  { id: "pacma",   name: "Partido Animalista Contra el Maltrato Animal",     short: "PACMA", color: "#00FF7F", logo: "pacma.jpg",  axis: 0, runs: true },
  { id: "nc",      name: "Nueva Canarias",                                   short: "NC",    color: "#86BD42", logo: "nc.png",     axis: -1, runs: true },
  { id: "fo",      name: "Frente Obrero",                                    short: "FO",    color: "#111111", logo: "fo.png",     axis: 2, runs: true },
  { id: "cup",     name: "Candidaturas d'Unitat Popular",                    short: "CUP",   color: "#FFEE00", logo: "cup.png",    axis: -3, runs: true },
  { id: "ac",      name: "Aliança Catalana",                                 short: "AC",   color: "#114B80", logo: "ac.png",    axis: 2, runs: true },
  { id: "vv",      name: "Varios",                                           short: "VV",    color: "#6e6e6e", logo: "vv.png",     axis: 0, runs: true },
];

// Partidos ordenados polos escaños das últimas eleccións (2023,
// descendente; os empates manteñen a orde da táboa). Úsase para o
// listado do editor.
const SEATS_LATEST = ELECTION_RESULTS["2023"] ?? {};
export const PARTIES_BY_SEATS: Party[] = [...PARTIES]
  .map((p, i) => ({ p, i }))
  .sort(
    (a, b) =>
      (SEATS_LATEST[b.p.id] ?? 0) - (SEATS_LATEST[a.p.id] ?? 0) || a.i - b.i
  )
  .map(({ p }) => p);

// Valor de eixo normalizado: enteiro entre -3 e 3 (por se o dato
// da táboa fose incorrecto, nunca rompe o debuxo).
export function axisValue(party: Party): number {
  return Math.max(-3, Math.min(3, Math.round(party.axis || 0)));
}

// Cor de texto lexible sobre un fondo de cor dada (branco ou case negro).
export function textOn(color: string): string {
  const hex = color.replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? "#1a1a1a" : "#ffffff";
}
