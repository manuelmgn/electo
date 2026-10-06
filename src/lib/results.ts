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
// - Os bloques baleiros non se amosan na app ata que lle engadas
//   algún partido.
//
// NOTA: a vista editable da app NON usa esta táboa; os valores por
// defecto do editor veñen do campo `seats` de parties.ts. Esta táboa
// alimenta só as vistas de resultados anteriores (só lectura).
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
  "2016": {  
    pp: 137,
    psoe: 85,
    vox: 0,
    cs: 32,
    jxc: 8,
    erc: 9,
    ehb: 2,
    pnv: 5,
    podemos: 62,
    bng: 0,
    upn: 0,
    cc: 1,
    te: 0,
    prc: 0,
    compromis: 0,
    cup: 0,
    mp: 0,
    vv: 0,
  },
};
