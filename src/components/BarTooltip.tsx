"use client";

import { useEffect, useRef, useState } from "react";
import { type Party, seatPercent } from "@/lib/parties";
import { useI18n } from "@/lib/i18n";
import PartyLogo from "./PartyLogo";

// Tooltip dun partido: siglas, escaños e porcentaxe. Compartido polas
// barras (SeatBar/GovBar) e polo hemiciclo: mesmo aspecto en toda a app.
// Ancórase horizontalmente no % de `left`; a posición vertical
// (top/bottom) e calquera transformación extra vaian en `style`.
export function SeatTooltip({
  party,
  count,
  left,
  style,
}: {
  party: Party;
  count: number;
  left: number;
  style?: React.CSSProperties;
}) {
  const { t } = useI18n();
  return (
    <div
      className="anim-pop pointer-events-none absolute z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 shadow-xl"
      style={{
        left: `${left}%`,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        ...style,
      }}
    >
      <PartyLogo party={party} className="h-7 w-7 text-[8px]" />
      <div className="min-w-0 leading-tight">
        <p className="max-w-40 truncate text-xs font-bold">{party.name}</p>
        <p className="text-sm font-extrabold tabular-nums">
          {count}{" "}
          <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
            {t.seats}
          </span>
        </p>
      </div>
      <span className="text-sm font-bold tabular-nums" style={{ color: "var(--muted)" }}>
        {seatPercent(count)}
      </span>
    </div>
  );
}

// Xestión do partido activo nas barras (SeatBar/GovBar): mesmo comportamento
// ca no hemiciclo — rato activa ao pasar e desactiva ao saír cun retardo
// para non pestanxear; o toque alterna o tooltip (tocar o mesmo péchao).
export function useBarHover() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const leaveTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  const enter = (id: string, pointerType: string) => {
    if (pointerType === "touch") return;
    window.clearTimeout(leaveTimer.current);
    setActiveId(id);
  };

  const leave = (id: string, pointerType: string) => {
    if (pointerType === "touch") return;
    leaveTimer.current = window.setTimeout(
      () => setActiveId((cur) => (cur === id ? null : cur)),
      100
    );
  };

  const tap = (id: string, pointerType: string) => {
    if (pointerType === "mouse") return;
    window.clearTimeout(leaveTimer.current);
    setActiveId((cur) => (cur === id ? null : id));
  };

  return { activeId, enter, leave, tap };
}

// Tooltip dun segmento de barra: ancorado no centro horizontal do segmento
// (leftPct, en % da largura da barra) e colocado xusto enriba da barra.
export default function BarTooltip({
  party,
  count,
  leftPct,
}: {
  party: Party;
  count: number;
  leftPct: number;
}) {
  const left = Math.min(92, Math.max(8, leftPct));
  return (
    <SeatTooltip
      party={party}
      count={count}
      left={left}
      style={{ top: -6, transform: "translate(-50%, -100%)" }}
    />
  );
}
