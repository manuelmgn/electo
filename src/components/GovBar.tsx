"use client";

import {
  PARTIES,
  TOTAL_SEATS,
  MAJORITY_SEATS,
  type Party,
} from "@/lib/parties";
import BarTooltip, { useBarHover } from "./BarTooltip";

// Trama que se aplica sobre os segmentos de aliados na barra de suma:
// liñas diagonais na mesma cor que o fondo da barra (var(--surface-2)),
// para diferenciar aliados de goberno sen saír da cor de cada partido.
//
// Variante con puntitos no canto de liñas (hai que engadir tamén
// backgroundSize: "6px 6px" onde se use):
//   "radial-gradient(var(--surface-2) 1.2px, transparent 1.2px)"
export const ALLY_HATCH =
  "repeating-linear-gradient(45deg, var(--surface-2) 0 2px, transparent 2px 6px)";

// Fronteira exacta entre os asentos 175 e 176 (inicio da maioría
// absoluta), a mesma posición que a liña do hemiciclo e da SeatBar.
const MAJORITY_BOUNDARY_PCT = ((MAJORITY_SEATS - 1) / TOTAL_SEATS) * 100; // = 50%

// Barra da suma de goberno: primeiro os partidos marcados como goberno
// (o de máis escaños á esquerda) e despois os aliados, tamén ordenados
// polos escaños. Cada segmento leva a cor do seu partido; os aliados
// engaden a trama diagonal ALLY_HATCH por riba. Cada un ocupa o seu
// ancho proporcional aos 350, así a liña vertical marca o que fai falla
// para a maioría (176). Ao pasar o rato ou tocar un segmento móstrase o
// mesmo tooltip ca no hemiciclo.
export default function GovBar({
  seats,
  governs,
  allies,
}: {
  seats: Record<string, number>;
  governs: Record<string, boolean>;
  allies: Record<string, boolean>;
}) {
  const { activeId, enter, leave, tap } = useBarHover();

  const bySeatsDesc = (a: (typeof PARTIES)[number], b: (typeof PARTIES)[number]) =>
    (seats[b.id] ?? 0) - (seats[a.id] ?? 0);
  const govParties = PARTIES.filter(
    (p) => governs[p.id] && (seats[p.id] ?? 0) > 0
  ).sort(bySeatsDesc);
  const allyParties = PARTIES.filter(
    (p) => !governs[p.id] && allies[p.id] && (seats[p.id] ?? 0) > 0
  ).sort(bySeatsDesc);
  const ordered = [...govParties, ...allyParties];

  // Segmentos co seu centro en % para ancorar o tooltip.
  const segments: { party: Party; count: number; centerPct: number }[] = [];
  let acc = 0;
  for (const p of ordered) {
    const count = seats[p.id] ?? 0;
    const widthPct = (count / TOTAL_SEATS) * 100;
    segments.push({ party: p, count, centerPct: acc + widthPct / 2 });
    acc += widthPct;
  }
  const active = segments.find((s) => s.party.id === activeId) ?? null;

  return (
    <div className="relative" role="img" aria-label="Suma de goberno e aliados">
      <div
        className="flex h-5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--surface-2)" }}
      >
        {segments.map((s) => {
          const dimmed = active !== null && active.party.id !== s.party.id;
          return (
            <div
              key={s.party.id}
              className="h-full"
              style={{
                width: `${(s.count / TOTAL_SEATS) * 100}%`,
                backgroundColor: s.party.color,
                backgroundImage: governs[s.party.id] ? undefined : ALLY_HATCH,
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
          barra para que se vexa ben sobre calquera cor. */}
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
