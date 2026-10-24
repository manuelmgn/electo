"use client";

import {
  PARTIES_BY_AXIS,
  TOTAL_SEATS,
  MAJORITY_SEATS,
  seatFraction,
  type Party,
} from "@/lib/parties";
import BarTooltip, { useBarHover } from "./BarTooltip";

// Fronteira exacta entre os asentos 175 e 176 (inicio da maioría
// absoluta), a mesma posición que a liña do hemiciclo.
const MAJORITY_BOUNDARY_PCT = ((MAJORITY_SEATS - 1) / TOTAL_SEATS) * 100; // = 50%

// Barra de escanos: un segmento por partido coa súa cor, na orde de
// eixo (esquerda → dereita, a mesma que usa o hemiciclo). Cada un
// ocupa o seu ancho proporcional aos 350, así a liña vertical marca
// a fronteira da maioría absoluta (176). Ao pasar o rato ou tocar un
// segmento móstrase o tooltip do partido e atenuase o resto.
export default function SeatBar({
  seats,
  height = "h-4",
  majorityLabel = String(MAJORITY_SEATS),
}: {
  seats: Record<string, number>;
  height?: string;
  majorityLabel?: string;
}) {
  const { activeId, enter, leave, tap } = useBarHover();

  // Segmentos co seu centro en % para ancorar o tooltip.
  const segments: { party: Party; count: number; centerPct: number }[] = [];
  let acc = 0;
  for (const p of PARTIES_BY_AXIS) {
    const count = seats[p.id] ?? 0;
    if (count <= 0) continue;
    const widthPct = seatFraction(count);
    segments.push({ party: p, count, centerPct: acc + widthPct / 2 });
    acc += widthPct;
  }

  const active = segments.find((s) => s.party.id === activeId) ?? null;

  return (
    <div className="relative" role="img" aria-label="Distribución de escaños">
      <div
        className={`flex w-full overflow-hidden rounded-full ${height}`}
        style={{ background: "var(--surface-2)" }}
      >
        {segments.length === 0 && (
          <div className="h-full w-full" style={{ background: "var(--surface-2)" }} />
        )}
        {segments.map((s) => {
          const dimmed = active !== null && active.party.id !== s.party.id;
          return (
            <div
              key={s.party.id}
              className="h-full"
              style={{
                width: `${seatFraction(s.count)}%`,
                background: s.party.color,
                opacity: dimmed ? 0.25 : 1,
                cursor: "pointer",
                transition:
                  "width 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.15s ease",
              }}
              onPointerEnter={(e) => enter(s.party.id, e.pointerType)}
              onPointerLeave={(e) => leave(s.party.id, e.pointerType)}
              onPointerDown={(e) => tap(s.party.id, e.pointerType)}
            />
          );
        })}
      </div>
      {/* Liña da maioría absoluta: fronteira asento 175/176. Sobresae da
          barra para que se vexa ben sobre calquera cor de partido. */}
      <div
        className="absolute"
        style={{
          left: `${MAJORITY_BOUNDARY_PCT}%`,
          top: -4,
          bottom: -4,
          width: 2,
          transform: "translateX(-50%)",
          background: "var(--text)",
          opacity: 0.45,
          borderRadius: 2,
        }}
        title={majorityLabel}
      />
      {active && (
        <BarTooltip
          party={active.party}
          count={active.count}
          leftPct={active.centerPct}
        />
      )}
    </div>
  );
}
