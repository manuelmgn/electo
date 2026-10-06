// ============================================================
// RESULTADOS DE ELECCIÓNS ANTERIORES — EDITA AQUÍ
// ------------------------------------------------------------
// Táboa de resultados por elección: para cada elección (clave), un
// mapa de id de partido → número de escaños.
//
// - Os ids deben coincidir cos da táboa de partidos (parties.ts).
// - Podes dar valores a partidos desactivados (runs: false en
//   parties.ts, como Ciudadanos): aparecen nas vistas de resultados
//   pero non na vista editable.
// - Para engadir outra elección, copia un bloque e cambia a clave
//   (por exemplo "2016").
// - Os bloquéíños baleiros (coma "2019" debaixo) non se amosan na
//   app ata que lle engadas algún partido.
//
// IMPORTANTE: a vista editable da app arrinca cos valores de "2023"
// como predeterminados (só os partidos con runs: true), que son
// totalmente modificables. É dicir: non é unha vista fixa de 2023,
// son valores por defecto.
// ============================================================

export type ElectionResults = Record<string, Record<string, number>>;

export const ELECTION_RESULTS: ElectionResults = {
  "2023": {
    pp: 137,
    psoe: 121,
    vox: 33,
    fe: 27,
    jxc: 7,
    erc: 7,
    ehb: 6,
    pnv: 5,
    podemos: 4,
    bng: 1,
    upn: 1,
    cc: 1,
    pacma: 0,
    nc: 0,
    fo: 0,
    cup: 0,
    ac: 0,
    vv: 0,
  },
  "2019": {  
    pp: 89,
    psoe: 120,
    vox: 52,
    cs: 10,
    jxc: 8,
    erc: 13,
    ehb: 5,
    pnv: 6,
    podemos: 35,
    bng: 1,
    upn: 2,
    cc: 2,
    te: 1,
    prc: 1,
    compromis: 1,
    cup: 2,
    mp: 2,
    vv: 0,
  },
};
