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

// Goberno de cada elección: para cada elección (clave, a mesma que en
// ELECTION_RESULTS), un mapa de id de partido → true se formou parte
// do goberno ou false (ou ausente) se non. Úsase para iluminar en verde
// os partidos gobernantes nas vistas de resultados anteriores.
export type ElectionGovernment = Record<string, Record<string, boolean>>;

export const ELECTION_GOVERNMENT: ElectionGovernment = {
  "2023": { psoe: true, s: true },
  "2019 I": { psoe: true },
  "2019 II": { psoe: true, podemos: true },
  "2016": { pp: true },
};

export const ELECTION_RESULTS: ElectionResults = {
  "2023": {
    pp: 137,
    psoe: 121,
    vox: 33,
    s: 27,
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
  "2019 I": {  
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
    com: 1,
    cup: 2,
    mp: 2,
    vv: 0,
  },
  "2019 II": {  
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
    com: 1,
    cup: 2,
    mp: 2,
    vv: 0,
  },
  "2016": {  
    pp: 137,
    psoe: 85,
    podemos: 62,
    cs: 32,
    com: 9,
    erc: 9,
    jxc: 8,
    pnv: 5,
    ehb: 2,
    cc: 1,
  },
};
