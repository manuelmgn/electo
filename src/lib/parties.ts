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
//            (de momento non se cargan; cando subas os logos a
//            esa carpeta, o nome xa estará correcto).
// - seats:   escaños que o partido ten actualmente (ou tiña nas
//            últimas eleccións). Só se usa para ORDENAR a lista
//            de partidos no editor principal (de maior a menor).
//            NON afecta ao hemiciclo nin á barra.
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
};

export const TOTAL_SEATS = 350;

export const PARTIES: Party[] = [
  { id: "cup",     name: "Candidaturas d'Unitat Popular",                    short: "CUP",   color: "#FFEE00", logo: "cup.png",     seats: 2,   axis: -3 },
  { id: "fo",      name: "Frente Obrero",                                    short: "FO",    color: "#111111", logo: "fo.png",      seats: 0,   axis: -3 },
  { id: "fe",      name: "Frente Amplio",                                    short: "FE",    color: "#EC407A", logo: "fe.png",      seats: 38,   axis: -3 },
  { id: "bng",     name: "Bloque Nacionalista Galego",                       short: "BNG",   color: "#7FC4E8", logo: "bng.png",     seats: 1,   axis: -2 },
  { id: "ehb",     name: "EH Bildu",                                         short: "EHB",   color: "#0BCFB5", logo: "ehb.png",     seats: 5,   axis: -2 },
  { id: "podemos", name: "Podemos",                                          short: "P.",    color: "#7D3C98", logo: "podemos.png", seats: 5,   axis: -2 },
  { id: "psoe",    name: "Partido Socialista Obrero Español",                short: "PSOE",  color: "#E30613", logo: "psoe.png",    seats: 120, axis: -2 },
  { id: "erc",     name: "Esquerra Republicana de Catalunya",                short: "ERC",   color: "#F9B233", logo: "erc.png",     seats: 13,   axis: -1 },
  { id: "pacma",   name: "Partido Animalista Contra el Maltrato Animal",     short: "PACMA", color: "#00FF7F", logo: "pacma.png",   seats: 0,   axis: 0 },
  { id: "cc",      name: "Coalición Canaria",                                short: "CC",    color: "#FFCE00", logo: "cc.png",      seats: 1,   axis: 0 },
  { id: "nc",      name: "Nueva Canarias",                                   short: "NC",    color: "#86BD42", logo: "nc.png",      seats: 0,   axis: 0 },
  { id: "jxc",     name: "Junts per Catalunya",                              short: "JxC",   color: "#00C1B1", logo: "jxc.png",     seats: 8,   axis: 1 },
  { id: "pnv",     name: "Partido Nacionalista Vasco",                       short: "PNV",   color: "#0E6E4E", logo: "pnv.png",     seats: 6,   axis: 1 },
  { id: "upn",     name: "Unión del Pueblo Navarro",                         short: "UPN",   color: "#3A5FBD", logo: "upn.png",     seats: 2,   axis: 1 },
  { id: "pp",      name: "Partido Popular",                                  short: "PP",    color: "#0B5FA5", logo: "pp.png",      seats: 89, axis: 2 },
  { id: "vox",     name: "Vox",                                              short: "Vox",   color: "#5AC035", logo: "vox.png",     seats: 52,  axis: 3 },
  { id: "ac",      name: "Aliança Catalana",                                 short: "AC",    color: "#134C81", logo: "ac.png",      seats: 0,   axis: 3 },
];

// Partidos ordenados por escaños actuais (descendente; os empates
// manteñen a orde da táboa). Úsase para o listado do editor.
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
