"use client";

import { useEffect, useMemo, useState } from "react";
import { PARTIES, TOTAL_SEATS, axisValue, type Party } from "@/lib/parties";
import { useI18n } from "@/lib/i18n";

type Seat = { x: number; y: number; color: string; party: Party; count: number };

const CX = 200; // centro X
const CY = 210; // centro Y (base do semicírculo)
const R_INNER = 64;
const R_OUTER = 188;
const ROWS = 10;
const SEAT_R = 5.6;
const MARGIN = (6 * Math.PI) / 180; // marxe nos extremos
const MAJORITY = 176; // maioría absoluta: primeiro asento á dereita do centro

// Xeración dos asentos: filas concéntricas proporcionais ao raio,
// ordenadas esquerda → dereita polo eixo (-3 a 3) do partido.
function buildSeats(seats: Record<string, number>): Seat[] {
  const total = Object.values(seats).reduce((a, b) => a + b, 0);
  if (total <= 0) return [];

  const order = PARTIES.map((p, i) => ({ p, i })).sort(
    (a, b) => axisValue(a.p) - axisValue(b.p) || a.i - b.i
  );

  const radii = Array.from(
    { length: ROWS },
    (_, i) => R_INNER + ((R_OUTER - R_INNER) * i) / (ROWS - 1)
  );
  const sumR = radii.reduce((a, b) => a + b, 0);

  // Reparto de asentos por fila proporcional ao raio (con axuste de
  // restos para que sume exactamente o total).
  const exact = radii.map((r) => (total * r) / sumR);
  const counts = exact.map(Math.floor);
  let remaining = total - counts.reduce((a, b) => a + b, 0);
  const byFrac = exact
    .map((e, i) => ({ f: e - counts[i], i }))
    .sort((a, b) => b.f - a.f);
  for (let k = 0; k < remaining; k++) counts[byFrac[k].i]++;

  // Posicións angulares: ángulo π = esquerda, 0 = dereita.
  const span = Math.PI - 2 * MARGIN;
  const positions: { angle: number; r: number }[] = [];
  for (let i = 0; i < ROWS; i++) {
    const n = counts[i];
    for (let j = 0; j < n; j++) {
      const angle = Math.PI - MARGIN - ((j + 0.5) / n) * span;
      positions.push({ angle, r: radii[i] });
    }
  }
  // Esquerda → dereita; no mesmo ángulo, fila exterior primeiro.
  positions.sort((a, b) => b.angle - a.angle || b.r - a.r);

  const out: Seat[] = [];
  let idx = 0;
  for (const { p } of order) {
    const n = seats[p.id] ?? 0;
    for (let k = 0; k < n && idx < positions.length; k++, idx++) {
      const { angle, r } = positions[idx];
      out.push({
        x: CX + r * Math.cos(angle),
        y: CY - r * Math.sin(angle),
        color: p.color,
        party: p,
        count: n,
      });
    }
  }
  return out;
}

export default function Hemicycle({ seats }: { seats: Record<string, number> }) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const all = useMemo(() => buildSeats(seats), [seats]);
  const total = all.length;

  return (
    <svg viewBox="0 0 400 224" className="w-full" role="img" aria-label="Hemiciclo de escaños">
      {/* Liña da maioría absoluta: no centro separa os asentos 175 e 176 */}
      <line
        x1={CX}
        y1={18}
        x2={CX}
        y2={CY - R_INNER + 6}
        stroke="currentColor"
        strokeOpacity={0.35}
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <text
        x={CX}
        y={12}
        textAnchor="middle"
        fill="currentColor"
        opacity={0.55}
        style={{ fontSize: 11, fontWeight: 800 }}
      >
        {MAJORITY}
      </text>

      {all.map((s, i) => (
        <circle
          key={i}
          r={SEAT_R}
          fill={s.color}
          style={{
            transform: mounted
              ? `translate(${s.x}px, ${s.y}px)`
              : `translate(${CX}px, ${CY}px) scale(0)`,
            transition: `transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(i * 1.5, 450)}ms`,
          }}
        >
          <title>
            {`${s.party.name} (${s.party.short}) — ${s.count} ${t.seats} · ${((s.count / TOTAL_SEATS) * 100).toFixed(1)}%`}
          </title>
        </circle>
      ))}

      <text
        x={CX}
        y={CY - 34}
        textAnchor="middle"
        fill="currentColor"
        style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em" }}
      >
        {total}
      </text>
      <text
        x={CX}
        y={CY - 12}
        textAnchor="middle"
        fill="currentColor"
        style={{ fontSize: 13, fontWeight: 600, opacity: 0.5 }}
      >
        / {TOTAL_SEATS}
      </text>
    </svg>
  );
}
