"use client";

import { useMemo } from "react";
import {
  PARTIES,
  governmentShade,
  governmentSumColor,
} from "@/lib/parties";
import { useI18n } from "@/lib/i18n";
import GovBar, { ALLY_HATCH } from "./GovBar";

// Tarxeta da suma de goberno + aliados, compartida polo editor e polas
// vistas de só lectura: insignia "Goberno: N" coa cor segundo se chega
// á maioría absoluta, leyenda (🏛️ goberno sen trama / 🤝 aliado con
// trama, ambos na cor do partido gobernante con máis escaños) e a
// barra segmentada de GovBar. Se non hai ningún partido marcado con
// escaños, non se amosa nada.
//
// `note` engade contido extra dentro da insignia (o editor pon aí os
// escaños que restan ou sobran). Con `alwaysShow`, o editor mantén a
// tarxeta aínda cando non hai marcas (evita saltos de layout).
export default function GovSumCard({
  seats,
  governs,
  allies,
  note,
  alwaysShow = false,
}: {
  seats: Record<string, number>;
  governs: Record<string, boolean>;
  allies: Record<string, boolean>;
  note?: React.ReactNode;
  alwaysShow?: boolean;
}) {
  const { t } = useI18n();

  // Suma de escaños dos partidos gobernantes ou aliados.
  const govTotal = useMemo(
    () =>
      PARTIES.reduce(
        (acc, p) =>
          acc + (governs[p.id] || allies[p.id] ? (seats[p.id] ?? 0) : 0),
        0
      ),
    [governs, allies, seats]
  );

  // Cor do partido gobernante con máis escaños: mostra na leyenda da
  // barra o "cor de partido" (goberno vai sen trama; aliados, con ela).
  const topGovColor = useMemo(() => {
    const top = PARTIES.filter((p) => governs[p.id] && (seats[p.id] ?? 0) > 0)
      .sort((a, b) => (seats[b.id] ?? 0) - (seats[a.id] ?? 0))[0];
    return top?.color ?? governmentShade(0, 1);
  }, [governs, seats]);

  if (govTotal === 0 && !alwaysShow) return null;

  const govColor = governmentSumColor(govTotal);

  return (
    <section className="card space-y-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <span
          className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold"
          style={{
            background: `color-mix(in srgb, ${govColor} 15%, transparent)`,
            color: govColor,
          }}
        >
          {t.government}: {govTotal}
          {note}
        </span>
        <div
          className="flex shrink-0 items-center gap-3 text-[11px] font-semibold"
          style={{ color: "var(--muted)" }}
        >
          <span className="flex items-center gap-1">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: topGovColor }}
            />
            🏛️ {t.government}
          </span>
          <span className="flex items-center gap-1">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: topGovColor, backgroundImage: ALLY_HATCH }}
            />
            🤝 {t.ally}
          </span>
        </div>
      </div>
      <GovBar seats={seats} governs={governs} allies={allies} />
    </section>
  );
}
