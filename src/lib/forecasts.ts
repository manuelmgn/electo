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
  "Electomanía — outubro 2026": {
    published: true,
    seats: {
      pp: 150,
      psoe: 95,
      vox: 30,
      fa: 30,
      erc: 8,
      ehb: 7,
      jxc: 7,
      pnv: 6,
      podemos: 4,
      com: 2,
      cup: 2,
      bng: 1,
      upn: 1,
      cc: 1,
      aa: 1,
      prc: 1,
      upl: 1,
      salf: 1,
      pacma: 1,
      nc: 1,
    },
    government: { pp: true },
    allies: { vox: true },
  },
  "CIS — setembro 2026": {
    published: false,
    seats: {
      pp: 145,
      psoe: 105,
      vox: 35,
      fa: 25,
      jxc: 8,
      erc: 7,
      ehb: 6,
      pnv: 5,
      podemos: 6,
      com: 2,
      bng: 2,
      cup: 2,
      cc: 1,
      upn: 1,
    },
    government: { psoe: true, fa: true },
    allies: { erc: true, ehb: true, pnv: true, podemos: true },
  },
};
