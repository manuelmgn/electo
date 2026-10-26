"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  PARTIES,
  allyShade,
  governmentShade,
  seatPercent,
} from "@/lib/parties";
import { buildShareLines } from "@/lib/share";
import {
  ELECTION_VIEWS,
  FORECAST_VIEWS,
  viewList,
} from "@/lib/views";
import { useI18n } from "@/lib/i18n";
import { useTimedFlag } from "@/lib/useTimedFlag";
import SeatBar from "./SeatBar";
import Hemicycle from "./Hemicycle";
import PartyLogo from "./PartyLogo";
import GovSumCard from "./GovSumCard";
import { CenterToast } from "./Toast";

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
  const shareNotice = useTimedFlag<"ok">(3200);

  // Partidos con escaños, ordenados por escaños; en caso de empate,
  // alfabeticamente polo nome.
  const viewParties = useMemo(
    () =>
      PARTIES.filter((p) => (seats[p.id] ?? 0) > 0).sort(
        (a, b) =>
          (seats[b.id] ?? 0) - (seats[a.id] ?? 0) ||
          a.name.localeCompare(b.name)
      ),
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

  // Eleccións e pronósticos coas súas vistas (mesma orde que no editor).
  const elections = useMemo(() => viewList(ELECTION_VIEWS), []);
  const forecasts = useMemo(() => viewList(FORECAST_VIEWS), []);

  const share = async () => {
    const url = `${window.location.origin}${shareUrl}`;
    const text = `${title}\n\n${buildShareLines(seats, government, allies, PARTIES).join("\n")}\n\n${url}`;
    try {
      await navigator.clipboard.writeText(text);
      shareNotice.fire("ok");
    } catch {
      // sen permiso de portapapeis: non se amosa aviso
    }
  };

  return (
    <div className="anim-fade-up space-y-4 px-4 py-4">
      <section className="card hero-card space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h1
            className="min-w-0 truncate text-sm font-bold uppercase tracking-wide"
            style={{ color: "var(--muted)" }}
          >
            {title}
          </h1>
          <Link href="/" className="btn btn-ghost shrink-0 !px-3 !py-1 text-xs">
            {t.backToEdit}
          </Link>
        </div>
        <Hemicycle seats={seats} />
        <SeatBar seats={seats} height="h-3.5" majorityLabel={t.majorityInfo} />
      </section>

      {/* Suma de goberno + aliados: tarxeta coa insignia + leyenda e a
          barra debaixo, coa liña da maioría (oculta se non hai marcas). */}
      <GovSumCard seats={seats} governs={government} allies={allies} />

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
                {seatPercent(seats[p.id] ?? 0)}
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

      {/* Volver á edición */}
      <Link href="/" className="btn btn-ghost block w-full text-center text-base">
        {t.backToEdit}
      </Link>

      {/* Resultados de eleccións anteriores */}
      <section className="space-y-2">
        <h2 className="px-1 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
          {t.pastResults}
        </h2>
        <div className="flex flex-wrap gap-2">
          {elections.map((e) => (
            <Link key={e.slug} href={`/r/${e.slug}`} className="btn btn-ghost !py-1.5 text-sm">
              {e.key}
            </Link>
          ))}
        </div>
      </section>

      {/* Pronósticos precargados */}
      <section className="space-y-2">
        <h2 className="px-1 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
          {t.forecasts}
        </h2>
        <div className="flex flex-wrap gap-2">
          {forecasts.map((f) => (
            <Link key={f.slug} href={`/f/${f.slug}`} className="btn btn-ghost !py-1.5 text-sm">
              {f.key}
            </Link>
          ))}
        </div>
      </section>

      {/* Aviso: ligazón copiada (desaparece só), centrado na ventana visible */}
      {shareNotice.value && (
        <CenterToast background="var(--copied)">{t.shareCopied}</CenterToast>
      )}
    </div>
  );
}
