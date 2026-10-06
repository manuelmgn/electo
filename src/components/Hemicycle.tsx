"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TOTAL_SEATS, MAJORITY_SEATS, type Party } from "@/lib/parties";
import { buildSeats, HEMICYCLE } from "@/lib/hemicycle";
import { useI18n } from "@/lib/i18n";
import PartyLogo from "./PartyLogo";

// Dimensións do viewBox do SVG (coordenadas → % para posicionar o tooltip).
const VB_W = 400;
const VB_H = 224;

export default function Hemicycle({ seats }: { seats: Record<string, number> }) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const leaveTimer = useRef<number | undefined>(undefined);

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
      left: Math.min(88, Math.max(12, (x / n / VB_W) * 100)),
      top: (y / n / VB_H) * 100,
    };
  }, [all, activeId]);

  // Hover (rato): entrar activa, saír desactiva cun pequeno retardo para
  // non pestanxear ao moverse entre asentos do mesmo partido.
  const handleEnter = (id: string, pointerType: string) => {
    if (pointerType === "touch") return;
    window.clearTimeout(leaveTimer.current);
    setActiveId(id);
  };

  const handleLeave = (id: string, pointerType: string) => {
    if (pointerType === "touch") return;
    leaveTimer.current = window.setTimeout(
      () => setActiveId((cur) => (cur === id ? null : cur)),
      100
    );
  };

  // Toque (smartphone/tableta): alterna o tooltip; tocar outro asento cambia
  // de partido e tocar o mesmo péchao.
  const handleTap = (id: string, pointerType: string) => {
    if (pointerType === "mouse") return;
    window.clearTimeout(leaveTimer.current);
    setActiveId((cur) => (cur === id ? null : id));
  };

  return (
    <div className="relative select-none">
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
              {/* Área de toque invisible: maior que o círculo visible para
                  que sexa cómodo pulsar en pantallas pequenas. */}
              <circle
                cx={s.x}
                cy={s.y}
                r={11}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onPointerEnter={(e) => handleEnter(s.party.id, e.pointerType)}
                onPointerLeave={(e) => handleLeave(s.party.id, e.pointerType)}
                onPointerDown={(e) => handleTap(s.party.id, e.pointerType)}
              />
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
        <div
          className="anim-pop pointer-events-none absolute z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 shadow-xl"
          style={{
            left: `${active.left}%`,
            bottom: `calc(${100 - active.top}% + 14px)`,
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <PartyLogo party={active.party} className="h-7 w-7 text-[8px]" />
          <div className="min-w-0 leading-tight">
            <p className="max-w-40 truncate text-xs font-bold">{active.party.name}</p>
            <p className="text-sm font-extrabold tabular-nums">
              {active.count}{" "}
              <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                {t.seats}
              </span>
            </p>
          </div>
          <span className="text-sm font-bold tabular-nums" style={{ color: "var(--muted)" }}>
            {((active.count / TOTAL_SEATS) * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
