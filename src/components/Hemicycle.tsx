"use client";

import { useEffect, useMemo, useState } from "react";
import { TOTAL_SEATS, MAJORITY_SEATS } from "@/lib/parties";
import { buildSeats, HEMICYCLE } from "@/lib/hemicycle";
import { useI18n } from "@/lib/i18n";

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

      {all.map((s, i) => (
        <circle
          key={i}
          r={HEMICYCLE.seatRadius}
          fill={s.color}
          style={{
            transform: mounted
              ? `translate(${s.x}px, ${s.y}px)`
              : `translate(${HEMICYCLE.cx}px, ${HEMICYCLE.cy}px) scale(0)`,
            transition: `transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(i * 1.5, 450)}ms`,
          }}
        >
          <title>
            {`${s.party.name} (${s.party.short}) — ${s.count} ${t.seats} · ${((s.count / TOTAL_SEATS) * 100).toFixed(1)}%`}
          </title>
        </circle>
      ))}

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
  );
}
