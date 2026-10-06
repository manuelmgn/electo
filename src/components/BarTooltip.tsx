"use client";

import { useEffect, useRef, useState } from "react";
import { TOTAL_SEATS, type Party } from "@/lib/parties";
import { useI18n } from "@/lib/i18n";
import PartyLogo from "./PartyLogo";

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
  const { t } = useI18n();
  const left = Math.min(92, Math.max(8, leftPct));
  return (
    <div
      className="anim-pop pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-full items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 shadow-xl"
      style={{
        left: `${left}%`,
        top: -6,
        background: "var(--surface)",
        border: "1px solid var(--border)",
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
        {((count / TOTAL_SEATS) * 100).toFixed(1)}%
      </span>
    </div>
  );
}
