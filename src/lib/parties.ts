// ============================================================
// TÁBOA DE PARTIDOS — EDITA AQUÍ
// ------------------------------------------------------------
// Podes engadir, quitar ou modificar partidos libremente.
// - id:      identificador único e estable (NON o cambies se xa
//            hai predicicións gardadas na base de datos).
// - name:    nome oficial do partido.
// - order: 1, short:   siglas que se amosan na interface.
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
// - emoji:   emoji que representa o partido (p. ex. un círculo de cor).
// ============================================================

export type Party = {
  id: string;
  name: string;
  order: number;
  short: string;
  color: string;
  logo: string;
  seats: number;
  axis: number;
  runs: boolean;
  emoji: string;
};

export const TOTAL_SEATS = 350;

// Escaños necesarios para a maioría absoluta (primeiro asento á
// dereita do centro do hemiciclo). Úsase no debuxo da liña central
// e na barra horizontal.
export const MAJORITY_SEATS = TOTAL_SEATS / 2 + 1;

export const PARTIES: Party[] = [
  { id: "pp",      name: "Partido Popular",                                  order: 1, short: "PP",    color: "#0B5FA5", logo: "pp.png",     axis: 2, runs: true, seats: 137, emoji: "💧" },
  { id: "psoe",    name: "Partido Socialista Obrero Español",                order: 2, short: "PSOE",  color: "#E30613", logo: "psoe.png",   axis: -1, runs: true, seats: 121, emoji: "🌹" },
  { id: "vox",     name: "Vox",                                              order: 3, short: "Vox",   color: "#5AC035", logo: "vox.png",    axis: 3, runs: true, seats: 33,  emoji: "🥦" },
  { id: "fa",      name: "Frente Amplio",                                    order: 4, short: "FA",    color: "#EC407A", logo: "fa.png",     axis: -2, runs: true, seats: 26,  emoji: "🌸" },
  { id: "jxc",     name: "Junts per Catalunya",                              order: 5, short: "JxC",   color: "#00C1B1", logo: "jxc.png",    axis: 1, runs: true, seats: 7,   emoji: "🥑" },
  { id: "erc",     name: "Esquerra Republicana de Catalunya",                order: 5, short: "ERC",   color: "#F9B233", logo: "erc.jpg",    axis: -2, runs: true, seats: 7,   emoji: "🍋" },
  { id: "ehb",     name: "EH Bildu",                                         order: 5, short: "EHB",   color: "#0BCFB5", logo: "ehb.jpg",    axis: -3, runs: true, seats: 6,   emoji: "🍃" },
  { id: "pnv",     name: "Partido Nacionalista Vasco",                       order: 5, short: "PNV",   color: "#0E6E4E", logo: "pnv.png",    axis: 1, runs: true, seats: 5,   emoji: "🍇" },
  { id: "podemos", name: "Podemos",                                          order: 4, short: "P.",    color: "#7D3C98", logo: "podemos.png",axis: -3, runs: true, seats: 4,   emoji: "🍆" },
  { id: "bng",     name: "Bloque Nacionalista Galego",                       order: 6, short: "BNG",   color: "#7FC4E8", logo: "bng.png",    axis: -3, runs: true, seats: 1,   emoji: "🧀" },
  { id: "upn",     name: "Unión del Pueblo Navarro",                         order: 6, short: "UPN",   color: "#3A5FBD", logo: "upn.jpg",    axis: 2, runs: true, seats: 1,   emoji: "🥔" },
  { id: "cc",      name: "Coalición Canaria",                                order: 6, short: "CC",    color: "#FFCE00", logo: "cc.png",     axis: 1, runs: true, seats: 1,   emoji: "🍌" },
  { id: "nc",      name: "Nueva Canarias",                                   order: 6, short: "NC",    color: "#86BD42", logo: "nc.png",     axis: -1, runs: true, seats: 0,   emoji: "🇮🇨" },
  { id: "cup",     name: "Candidaturas d'Unitat Popular",                    order: 7, short: "CUP",   color: "#FFEE00", logo: "cup.jpeg",   axis: -3, runs: true, seats: 0,   emoji: "🍍" },
  { id: "aa",      name: "Adelante Andalucía",                               order: 8, short: "AA",    color: "#24C87E", logo: "aa.jpeg",    axis: -3, runs: true, seats: 0,   emoji: "🥗" },
  { id: "pacma",   name: "Partido Animalista Contra el Maltrato Animal",     order: 8, short: "PACMA", color: "#00FF7F", logo: "pacma.jpg",  axis: 0, runs: true, seats: 0,   emoji: "🕊️" },
  { id: "fo",      name: "Frente Obrero",                                    order: 8, short: "FO",    color: "#111111", logo: "fo.png",     axis: 2, runs: true, seats: 0,   emoji: "⚫" },
  { id: "s",       name: "Sumar",                                            order: 3, short: "S.",    color: "#EC407A", logo: "s.png",      axis: -2, runs: false, seats: 0,  emoji: "🎀"},
  { id: "ac",      name: "Aliança Catalana",                                 order: 8, short: "AC",    color: "#114B80", logo: "ac.png",     axis: 2, runs: false, seats: 0,  emoji: "🔵" },
  { id: "cs",      name: "Ciudadanos",                                       order: 3, short: "CS",    color: "#EF5E2C", logo: "cs.jpeg",    axis: 1, runs: false, seats: 0,  emoji: "🍊" },
  { id: "te",      name: "Teruel Existe",                                    order: 8, short: "TE",    color: "#027F51", logo: "te.png",     axis: 0, runs: false, seats: 0,  emoji: "🍗" },
  { id: "com",     name: "Compromís",                                        order: 6, short: "C.",    color: "#DB6E24", logo: "com.jpeg",   axis: -2, runs: true, seats: 1,  emoji: "😉" },
  { id: "mp",      name: "Más País",                                         order: 6, short: "MP",    color: "#6AD9C4", logo: "mp.png",     axis: -1, runs: false, seats: 0,  emoji: "🌽" },
  { id: "prc",     name: "Partido Regionalista Cántabro",                    order: 7, short: "PRC",   color: "#BFCD16", logo: "prc.png",    axis: 0, runs: true, seats: 0,   emoji: "🍐" },
  { id: "gb",      name: "Geroa Bai",                                        order: 8, short: "GB",    color: "#D43527", logo: "gb.png",    axis: 0, runs: false, seats: 0,   emoji: "🍒" },
  { id: "upl",     name: "Unión del Pueblo Leonés",                          order: 8, short: "UPL",   color: "#B71966", logo: "upl.png",    axis: 0, runs: true, seats: 0,   emoji: "🦁" },
  { id: "salf",    name: "Se Acabó La Fiesta",                               order: 8, short: "SALF",  color: "#785B46", logo: "salf.png",    axis: 0, runs: true, seats: 0,   emoji: "🐿️" },
  { id: "vv",      name: "Varios",                                           order: 9, short: "VV",    color: "#6e6e6e", logo: "",     axis: 0, runs: true, seats: 0,   emoji: "⚪" },
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

// Tonalidade de verde para un partido que goberna. O rank 0 (partido
// con máis escaños entre os que gobernan) leva o verde máis intenso e
// cada partido adicional aclara un paso pequeno e fixo, ata un máximo
// suave propio dun quinto socio.
export function governmentShade(rank: number, total: number): string {
  const light = Math.min(28 + Math.max(rank, 0) * 6, 52);
  return `hsl(145, 60%, ${light}%)`;
}

// Tonalidade ámbar para un partido marcado como aliado: máis neutra ca
// o verde do goberno, para distinguir o apoio externo dos socios.
export function allyShade(): string {
  return "hsl(38, 65%, 52%)";
}

// Cor do indicador da suma de escaños do goberno: verde forte cando
// alcanza a maioría absoluta e vai degradando (verde claro, verde
// amarelento, amarelo, laranxa) ata o vermello moi por debaixo.
export function governmentSumColor(sum: number): string {
  if (sum >= MAJORITY_SEATS) return "#16a34a";
  if (sum >= 170) return "#94a30d";
  if (sum >= 160) return "#d2d616";
  if (sum >= 145) return "#ca8a04";
  if (sum >= 130) return "#ea580c";
  return "#dc2626";
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