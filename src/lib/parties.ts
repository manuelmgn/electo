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
// - seats:   escaños que se amosan POR DEFECTO ao cargar a app
//            (valores iniciais do editor, para os partidos con
//            runs: true; pódense modificar libremente).
// - runs:    se o partido se presenta ás eleccións (true) ou non
//            (false). Os desactivados non aparecen no editor.
// - axis:    posición no eixo esquerda-dereita, enteiro entre
//            -3 (esquerda) e 3 (dereita). Determina a posición
//            do partido no hemiciclo e na barra: a maior valor,
//            máis á dereita. Se dous partidos empatan, mántense
//            na orde da lista.
// ============================================================

export type Party = {
  id: string;
  name: string;
  short: string;
  color: string;
  logo: string;
  seats: number;
  axis: number;
  runs: boolean;
};

export const TOTAL_SEATS = 350;

// Escaños necesarios para a maioría absoluta (primeiro asento á
// dereita do centro do hemiciclo). Úsase no debuxo da liña central
// e na barra horizontal.
export const MAJORITY_SEATS = TOTAL_SEATS / 2 + 1;

export const PARTIES: Party[] = [
  { id: "pp",      name: "Partido Popular",                                  short: "PP",    color: "#0B5FA5", logo: "pp.png",     axis: 2, runs: true, seats: 137 },
  { id: "psoe",    name: "Partido Socialista Obrero Español",                short: "PSOE",  color: "#E30613", logo: "psoe.png",   axis: -1, runs: true, seats: 121 },
  { id: "vox",     name: "Vox",                                              short: "Vox",   color: "#5AC035", logo: "vox.png",    axis: 3, runs: true, seats: 33 },
  { id: "fe",      name: "Frente Amplio",                                    short: "FE",    color: "#EC407A", logo: "fa.png",     axis: -2, runs: true, seats: 27 },
  { id: "jxc",     name: "Junts per Catalunya",                              short: "JxC",   color: "#00C1B1", logo: "jxc.png",    axis: 1, runs: true, seats: 7 },
  { id: "erc",     name: "Esquerra Republicana de Catalunya",                short: "ERC",   color: "#F9B233", logo: "erc.jpg",    axis: -2, runs: true, seats: 7 },
  { id: "ehb",     name: "EH Bildu",                                         short: "EHB",   color: "#0BCFB5", logo: "ehb.jpg",    axis: -2, runs: true, seats: 6 },
  { id: "pnv",     name: "Partido Nacionalista Vasco",                       short: "PNV",   color: "#0E6E4E", logo: "pnv.png",    axis: 1, runs: true, seats: 5 },
  { id: "podemos", name: "Podemos",                                          short: "P.",    color: "#7D3C98", logo: "podemos.png",axis: -3, runs: true, seats: 4 },
  { id: "bng",     name: "Bloque Nacionalista Galego",                       short: "BNG",   color: "#7FC4E8", logo: "bng.png",    axis: -2, runs: true, seats: 1 },
  { id: "upn",     name: "Unión del Pueblo Navarro",                         short: "UPN",   color: "#3A5FBD", logo: "upn.jpg",    axis: 2, runs: true, seats: 1 },
  { id: "cc",      name: "Coalición Canaria",                                short: "CC",    color: "#FFCE00", logo: "cc.png",     axis: 1, runs: true, seats: 1 },
  { id: "nc",      name: "Nueva Canarias",                                   short: "NC",    color: "#86BD42", logo: "nc.png",     axis: -1, runs: true, seats: 0 },
  { id: "cup",     name: "Candidaturas d'Unitat Popular",                    short: "CUP",   color: "#FFEE00", logo: "cup.jpeg",    axis: -3, runs: true, seats: 0 },
  { id: "aa",      name: "Adelante Andalucía",                               short: "AA",   color: "#24C87E", logo: "aa.jpeg",    axis: -2, runs: true, seats: 0 },
  { id: "pacma",   name: "Partido Animalista Contra el Maltrato Animal",     short: "PACMA", color: "#00FF7F", logo: "pacma.jpg",  axis: 0, runs: true, seats: 0 },
  { id: "fo",      name: "Frente Obrero",                                    short: "FO",    color: "#111111", logo: "fo.png",     axis: 2, runs: true, seats: 0 },
  { id: "ac",      name: "Aliança Catalana",                                 short: "AC",   color: "#114B80", logo: "ac.png",    axis: 2, runs: false, seats: 0 },
  { id: "cs",      name: "Ciudadanos",                                 short: "CS",   color: "#EF5E2C", logo: "cs.jpeg",    axis: 2, runs: false, seats: 0 },
  { id: "te",      name: "Teruel Existe",                                 short: "TE",   color: "#027F51", logo: "te.png",    axis: 2, runs: false, seats: 0 },
  { id: "mp",      name: "Más País",                                 short: "MP",   color: "#6AD9C4", logo: "mp.png",    axis: 2, runs: false, seats: 0 },
  { id: "prc",      name: "Partido Regionalista Cántabro",                                 short: "PRC",   color: "#BFCD16", logo: "prc.png",    axis: 2, runs: true, seats: 0 },
  { id: "vv",      name: "Varios",                                           short: "VV",    color: "#6e6e6e", logo: "vv.png",     axis: 0, runs: true, seats: 0 },
];

// Partidos ordenados polos escaños por defecto (campo seats,
// descendente; os empates manteñen a orde da táboa). Úsase para o
// listado do editor.
export const PARTIES_BY_SEATS: Party[] = [...PARTIES]
  .map((p, i) => ({ p, i }))
  .sort((a, b) => b.p.seats - a.p.seats || a.i - b.i)
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
