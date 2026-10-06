"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  PARTIES,
  TOTAL_SEATS,
  allyShade,
  governmentShade,
  governmentSumColor,
} from "@/lib/parties";
import { buildShareLines } from "@/lib/share";
import { useI18n } from "@/lib/i18n";
import SeatBar from "./SeatBar";
import GovBar, { ALLY_HATCH } from "./GovBar";
import Hemicycle from "./Hemicycle";
import PartyLogo from "./PartyLogo";

type Seats = Record<string, number>;

// Vista de só lectura dun resultado electoral ou pronóstico. Vive nas
// rutas /r/[slug] e /f/[slug] e leva botón de compartir que copia a
// ligazón propia xunto cun resumo de escaños.
export default function ResultsView({
  title,
  seats,
  government,
  allies,
  shareUrl,
}: {
  title: string;
  seats: Seats;
  government: Record<string, boolean>;
  allies: Record<string, boolean>;
  shareUrl: string;
}) {
  const { t } = useI18n();
  const [shareNotice, setShareNotice] = useState(false);
  const shareTimer = useRef<number | null>(null);

  // Partidos con escaños, ordenados por escaños
  const viewParties = useMemo(
    () =>
      PARTIES.map((p, i) => ({ p, i }))
        .filter(({ p }) => (seats[p.id] ?? 0) > 0)
        .sort(
          (a, b) => (seats[b.p.id] ?? 0) - (seats[a.p.id] ?? 0) || a.i - b.i
        )
        .map(({ p }) => p),
    [seats]
  );

  // Partidos gobernantes ordenados por escaños (o maior leva a
  // tonalidade de verde máis intensa).
  const viewGovRanks = useMemo(() => {
    const ids = PARTIES.filter((p) => government[p.id])
      .sort((a, b) => (seats[b.id] ?? 0) - (seats[a.id] ?? 0))
      .map((p) => p.id);
    return Object.fromEntries(
      ids.map((id, i) => [id, { rank: i, total: ids.length }])
    );
  }, [government, seats]);

  // Suma de escaños de goberno + aliados.
  const viewGovTotal = useMemo(
    () =>
      PARTIES.reduce(
        (acc, p) =>
          acc + (government[p.id] || allies[p.id] ? (seats[p.id] ?? 0) : 0),
        0
      ),
    [government, allies, seats]
  );

  // Cor do partido gobernante con máis escaños, para a leyenda da barra.
  const viewTopGovColor = useMemo(() => {
    const top = PARTIES.filter(
      (p) => government[p.id] && (seats[p.id] ?? 0) > 0
    ).sort((a, b) => (seats[b.id] ?? 0) - (seats[a.id] ?? 0))[0];
    return top?.color ?? governmentShade(0, 1);
  }, [government, seats]);

  const share = async () => {
    const url = `${window.location.origin}${shareUrl}`;
    const text = `${title}\n\n${buildShareLines(seats, government, allies, PARTIES).join("\n")}\n\n${url}`;
    try {
      await navigator.clipboard.writeText(text);
      if (shareTimer.current !== null) window.clearTimeout(shareTimer.current);
      setShareNotice(true);
      shareTimer.current = window.setTimeout(() => setShareNotice(false), 3200);
    } catch {
      // sen permiso de portapapeis: non se amosa aviso
    }
  };

  return (
    <div className="anim-fade-up space-y-4 px-4 py-4">
      <section className="card hero-card space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2
            className="min-w-0 truncate text-sm font-bold uppercase tracking-wide"
            style={{ color: "var(--muted)" }}
          >
            {title}
          </h2>
          <Link href="/" className="btn btn-ghost shrink-0 !px-3 !py-1 text-xs">
            {t.backToEdit}
          </Link>
        </div>
        <Hemicycle seats={seats} />
        <SeatBar seats={seats} height="h-3.5" majorityLabel={t.majorityInfo} />
      </section>

      {/* Suma de goberno + aliados: tarxeta coa fila de insignia + leyenda
          e a barra debaixo, coa liña da maioría. Só se amosa se hai
          algún partido marcado. */}
      {viewGovTotal > 0 && (
        <section className="card space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <span
              className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold"
              style={{
                background: `color-mix(in srgb, ${governmentSumColor(viewGovTotal)} 15%, transparent)`,
                color: governmentSumColor(viewGovTotal),
              }}
            >
              {t.government}: {viewGovTotal}
            </span>
            <div
              className="flex shrink-0 items-center gap-3 text-[11px] font-semibold"
              style={{ color: "var(--muted)" }}
            >
              <span className="flex items-center gap-1">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ background: viewTopGovColor }}
                />
                🏛️ {t.government}
              </span>
              <span className="flex items-center gap-1">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{
                    backgroundColor: viewTopGovColor,
                    backgroundImage: ALLY_HATCH,
                  }}
                />
                🤝 {t.ally}
              </span>
            </div>
          </div>
          <GovBar seats={seats} governs={government} allies={allies} />
        </section>
      )}

      <section
        className="card divide-y overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >
        {viewParties.map((p, i) => {
          const gov = viewGovRanks[p.id];
          const ally = allies[p.id];
          const shade = gov ? governmentShade(gov.rank, gov.total) : "";
          const badgeColor = gov ? shade : allyShade();
          return (
            <div
              key={p.id}
              className="anim-fade-up flex items-center gap-2.5 px-3 py-2"
              style={{
                animationDelay: `${40 + i * 25}ms`,
                borderColor: "var(--border)",
                background:
                  gov || ally
                    ? `color-mix(in srgb, ${badgeColor} 20%, transparent)`
                    : undefined,
              }}
            >
              <PartyLogo party={p} />
              <span className="min-w-0 flex-1 truncate text-xs font-medium leading-tight">
                {p.name}
              </span>
              {/* Columna fixa para a etiqueta: resérvase o mesmo ancho
                  en todas as filas para que quede alineada. */}
              <span className="flex w-16 shrink-0 justify-end">
                {(gov || ally) && (
                  <span
                    className="w-full whitespace-nowrap rounded-full border px-1.5 py-px text-center text-[10px] font-bold uppercase leading-tight"
                    style={{ borderColor: badgeColor, color: badgeColor }}
                  >
                    {gov ? t.government : t.ally}
                  </span>
                )}
              </span>
              <span
                className="w-12 shrink-0 text-right text-xs tabular-nums"
                style={{ color: "var(--muted)" }}
              >
                {(((seats[p.id] ?? 0) / TOTAL_SEATS) * 100).toFixed(1)}%
              </span>
              <span className="w-10 shrink-0 text-right text-lg font-extrabold tabular-nums">
                {seats[p.id] ?? 0}
              </span>
            </div>
          );
        })}
      </section>

      {/* Compartir: copia o título + resumo de escaños + ligazón propia */}
      <section className="card p-4">
        <button onClick={share} className="btn btn-primary w-full text-base">
          {t.share}
        </button>
      </section>

      {/* Aviso superior: ligazón copiada (desaparece só) */}
      {shareNotice && (
        <div
          className="anim-toast fixed left-1/2 top-4 z-50 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-xl"
          style={{ background: "var(--copied)", color: "var(--bg)" }}
          role="status"
        >
          <span aria-hidden="true">🔗</span>
          {t.shareCopied}
        </div>
      )}
    </div>
  );
}
