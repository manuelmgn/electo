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
// ============================================================

export type Party = {
  id: string;
  name: string;
  short: string;
  color: string;
  logo: string;
};

export const TOTAL_SEATS = 350;

export const PARTIES: Party[] = [
  { id: "pp",    name: "Partido Popular",                                  short: "PP",    color: "#0B5FA5", logo: "pp.png" },
  { id: "psoe",  name: "Partido Socialista Obrero Español",                short: "PSOE",  color: "#E30613", logo: "psoe.png" },
  { id: "vox",   name: "Vox",                                              short: "Vox",   color: "#5AC035", logo: "vox.png" },
  { id: "fe",    name: "Frente Amplio",                                    short: "FE",    color: "#EC407A", logo: "fe.png" },
  { id: "podemos", name: "Podemos",                                        short: "P.",    color: "#7D3C98", logo: "podemos.png" },
  { id: "erc",   name: "Esquerra Republicana de Catalunya",                short: "ERC",   color: "#F9B233", logo: "erc.png" },
  { id: "jxc",   name: "Junts per Catalunya",                              short: "JxC",   color: "#00C1B1", logo: "jxc.png" },
  { id: "ehb",   name: "EH Bildu",                                         short: "EHB",   color: "#0BCFB5", logo: "ehb.png" },
  { id: "pnv",   name: "Partido Nacionalista Vasco",                       short: "PNV",   color: "#0E6E4E", logo: "pnv.png" },
  { id: "bng",   name: "Bloque Nacionalista Galego",                       short: "BNG",   color: "#7FC4E8", logo: "bng.png" },
  { id: "cc",    name: "Coalición Canaria",                                short: "CC",    color: "#FFCE00", logo: "cc.png" },
  { id: "upn",   name: "Unión del Pueblo Navarro",                         short: "UPN",   color: "#3A5FBD", logo: "upn.png" },
  { id: "pacma", name: "Partido Animalista Contra el Maltrato Animal",     short: "PACMA", color: "#00FF7F", logo: "pacma.png" },
  { id: "cup",   name: "Candidaturas d'Unitat Popular",                    short: "CUP",   color: "#FFEE00", logo: "cup.png" },
  { id: "fo",    name: "Frente Obrero",                                    short: "FO",    color: "#111111", logo: "fo.png" },
  { id: "nc",    name: "Nueva Canarias",                                   short: "NC",    color: "#86BD42", logo: "nc.png" },
  { id: "ac",    name: "Aliança Catalana",                                 short: "AC",    color: "#134C81", logo: "ac.png" },
];

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
