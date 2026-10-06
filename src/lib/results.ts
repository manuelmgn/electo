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
// - A continuación van dúas táboas paralelas, coas mesmas claves:
//   ELECTION_GOVERNMENT (quen formou parte do goberno) e
//   ELECTION_ALLIES (quen apoiou a investidura ou ao goberno sen
//   formar parte del). Un partido non pode estar nas dúas á vez.
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
  "2019 (I)": {  },
  "2019 (II)": { psoe: true, podemos: true },
  "2016": { pp: true },
};

// Aliados de cada elección: para cada elección (clave, a mesma que en
// ELECTION_RESULTS), un mapa de id de partido → true se apoiou ao
// goberno (pacto de investidura, abstención favorable, apoio externo)
// sen formar parte del. Úsase para iluminar en ámbar os partidos
// aliados nas vistas de resultados anteriores. Un partido non pode ser
// á vez goberno e aliado na mesma elección.
export type ElectionAllies = Record<string, Record<string, boolean>>;

export const ELECTION_ALLIES: ElectionAllies = {
  "2023": { erc: true, jxc: true, ehb: true, pnv: true, bng: true, cc: true },
  "2019 (I)": {  },
  "2019 (II)": { pnv: true, mp: true, nc: true, com: true, te: true, bng: true },
  "2016": { cs: true, cc:true },
};

export const ELECTION_RESULTS: ElectionResults = {
  "2023": {
    pp: 137,
    psoe: 121,
    vox: 33,
    s: 31,
    jxc: 7,
    erc: 7,
    ehb: 6,
    pnv: 5,
    bng: 1,
    upn: 1,
    cc: 1,
  },
  "2019 (I)": {  
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
  },
  "2019 (II)": {  
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
    cc: 1,
    nc: 1,
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
