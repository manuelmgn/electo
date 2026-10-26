"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TOTAL_SEATS, MAJORITY_SEATS, type Party } from "@/lib/parties";
import { buildSeats, HEMICYCLE } from "@/lib/hemicycle";
import { SeatTooltip } from "./BarTooltip";

// Dimensións do viewBox do SVG (coordenadas → % para posicionar o tooltip).
const VB_W = 400;
const VB_H = 224;

export default function Hemicycle({ seats }: { seats: Record<string, number> }) {
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const leaveTimer = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  const all = useMemo(() => buildSeats(seats), [seats]);
  const total = all.length;

  // Centroide do partido activo para ancorar o tooltip xusto enriba dos
  // seus asentos (tamén serve para saber se o partido segue existindo).
  const active = useMemo(() => {
    if (!activeId) return null;
    let x = 0;
    let y = 0;
    let n = 0;
    let party: Party | null = null;
    let count = 0;
    for (const s of all) {
      if (s.party.id !== activeId) continue;
      party = s.party;
      count = s.count;
      x += s.x;
      y += s.y;
      n++;
    }
    if (!party || n === 0) return null;
    return {
      party,
      count,
      // A mesma marxe ca nas barras: evita que o tooltip saia polos
      // lados cando o partido está no extremo do hemiciclo.
      left: Math.min(70, Math.max(30, (x / n / VB_W) * 100)),
      top: (y / n / VB_H) * 100,
    };
  }, [all, activeId]);

  // Asenta o punteiro no asento máis próximo (en coordenadas do viewBox).
  // Antes cada asento tiña un círculo de toque invisible de r=11 que se
  // solapaba co dos veciños e podía amosar o partido equivocado; así o
  // cálculo é sempre o asento visible máis achegado.
  const nearestParty = (clientX: number, clientY: number): string | null => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * VB_W;
    const y = ((clientY - rect.top) / rect.height) * VB_H;
    let best: (typeof all)[number] | null = null;
    let bestDist = Infinity;
    for (const seat of all) {
      const dx = seat.x - x;
      const dy = seat.y - y;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        best = seat;
      }
    }
    // Fóra dos asentos (centro baleiro, marxes) non se activa nada.
    return best && bestDist <= 16 * 16 ? best.party.id : null;
  };

  // Hover (rato): segue o asento máis próximo.
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(leaveTimer.current);
    setActiveId(nearestParty(e.clientX, e.clientY));
  };

  // Saír do hemiciclo desactiva o tooltip (con retardo mínimo).
  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    leaveTimer.current = window.setTimeout(() => setActiveId(null), 100);
  };

  // Toque (smartphone/tableta): alterna o tooltip; tocar outro asento cambia
  // de partido e tocar o mesmo péchao.
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    window.clearTimeout(leaveTimer.current);
    const id = nearestParty(e.clientX, e.clientY);
    if (!id) return;
    setActiveId((cur) => (cur === id ? null : id));
  };

  return (
    <div
      ref={containerRef}
      className="relative cursor-pointer select-none"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
    >
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full" role="img" aria-label="Hemiciclo de escaños">
        {/* Liña da maioría absoluta: no centro separa os asentos 175 e 176 */}
        <line
          x1={HEMICYCLE.cx}
          y1={18}
          x2={HEMICYCLE.cx}
          y2={HEMICYCLE.cy - HEMICYCLE.rInner + 6}
          stroke="currentColor"
          strokeOpacity={0.35}
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
        <text
          x={HEMICYCLE.cx}
          y={12}
          textAnchor="middle"
          fill="currentColor"
          opacity={0.55}
          style={{ fontSize: 11, fontWeight: 800 }}
        >
          {MAJORITY_SEATS}
        </text>

        {all.map((s, i) => {
          const isActive = active?.party.id === s.party.id;
          const dimmed = active !== null && !isActive;
          return (
            <g key={i}>
              <circle
                r={HEMICYCLE.seatRadius}
                fill={s.color}
                pointerEvents="none"
                style={{
                  transform: mounted
                    ? `translate(${s.x}px, ${s.y}px) scale(${isActive ? 1.35 : 1})`
                    : `translate(${HEMICYCLE.cx}px, ${HEMICYCLE.cy}px) scale(0)`,
                  // O retardo escalonado só se aplica á animación de entrada;
                  // o resaltado ao pasar o rato/toque é instantáneo.
                  transition: mounted
                    ? "transform 0.15s ease, opacity 0.15s ease"
                    : `transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(i * 1.5, 450)}ms`,
                  opacity: dimmed ? 0.25 : 1,
                }}
              />
            </g>
          );
        })}

        <text
          x={HEMICYCLE.cx}
          y={HEMICYCLE.cy - 34}
          textAnchor="middle"
          fill="currentColor"
          style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em" }}
        >
          {total}
        </text>
        <text
          x={HEMICYCLE.cx}
          y={HEMICYCLE.cy - 12}
          textAnchor="middle"
          fill="currentColor"
          style={{ fontSize: 13, fontWeight: 600, opacity: 0.5 }}
        >
          / {TOTAL_SEATS}
        </text>
      </svg>

      {active && (
        <SeatTooltip
          party={active.party}
          count={active.count}
          left={active.left}
          // Coloca o tooltip enriba do partido, pero sen saír pola parte
          // superior do hemiciclo (nos asentos da primeira fila cortábase).
          style={{
            bottom: `min(calc(${100 - active.top}% + 14px), calc(100% - 66px))`,
          }}
        />
      )}
    </div>
  );
}
