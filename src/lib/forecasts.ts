// ============================================================
// PRONÓSTICOS PRECARGADOS — EDITA AQUÍ
// ------------------------------------------------------------
// Táboa de pronósticos electorais precargados (enquisas,
// casas de apostas, medios, etc.). Funciona como a táboa de
// resultados anteriores (results.ts), pero cada pronóstico vai
// nun único bloque con tres campos:
//
// - published: se é true, o pronóstico amósase publicamente na
//   app (botón na sección "Pronósticos"); se é false, queda
//   gardado no código pero NON se amosa. É a única diferenza
//   coa táboa de resultados.
// - seats:     mapa de id de partido → escaños (os ids deben
//   coincidir cos de parties.ts; poden ser partidos con
//   runs: false, como nos resultados).
// - government: mapa de id de partido → true se formaría parte
//   do goberno (ilumínase en verde).
// - allies:    mapa de id de partido → true se apoiaría ao
//   goberno sen formar parte del (ilumínase en ámbar). Non pode
//   haber un partido á vez en government e allies.
//
// Para engadir outro pronóstico, copia un bloque e cambia a
// clave (o nome que se amosa no botón, por exemplo
// "Electomanía — outubro 2026"). Os bloques con seats baleiro
// non se amosan, e os con published: false tampouco.
//
// NOTA: os dous exemplos de abaixo son de mostra; edítalos ou
// bórraos e pon os pronósticos reais que queiras publicar.
// ============================================================

export type Forecast = {
  published: boolean;
  seats: Record<string, number>;
  government: Record<string, boolean>;
  allies: Record<string, boolean>;
};

export const FORECASTS: Record<string, Forecast> = {
  "2026-09 (CIS-Electomanía)": {
    published: true,
    seats: {
      pp: 109,
      psoe: 141,
      vox: 62,
      erc: 10,
      ehb: 7,
      s: 9,
      podemos: 5,
      pnv: 3,
      jxc: 2,
      bng: 2,
    },
    government: { pp: true, vox: true },
    allies: {  },
  },
  "2026-09 (Celeste Tel)": {
    published: true,
    seats: {
      pp: 147,
      psoe: 101,
      vox: 62,
      s: 6,
      vv: 34,
    },
    government: { pp: true, vox: true },
    allies: {  },
  },
};
