"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PARTIES, PARTIES_BY_SEATS, TOTAL_SEATS } from "@/lib/parties";
import { ELECTION_RESULTS } from "@/lib/results";
import { useI18n, errorMessage } from "@/lib/i18n";
import SeatBar from "./SeatBar";
import Hemicycle from "./Hemicycle";
import PartyLogo from "./PartyLogo";

type Seats = Record<string, number>;

export type EditorUser = { name: string } | null;

type LocalPrediction = {
  id: number;
  title: string;
  seats: Seats;
  createdAt: string;
};

function emptySeats(): Seats {
  return Object.fromEntries(PARTIES.map((p) => [p.id, 0]));
}

// Valores por defecto do editor: os resultados de 2023 (que son
// totalmente modificables), limitados aos partidos que se presentan
// (runs: true). O botón "Limpar" pon todo a 0.
const DEFAULT_RESULTS = ELECTION_RESULTS["2023"] ?? {};
function defaultSeats(): Seats {
  return Object.fromEntries(
    PARTIES.map((p) => [p.id, p.runs ? (DEFAULT_RESULTS[p.id] ?? 0) : 0])
  );
}

// Input numérico editable a man: mantén o texto mentres hai foco e
// só propaga valores enteiros válidos (limitados ao máximo posible).
function SeatInput({
  value,
  max,
  label,
  onChange,
}: {
  value: number;
  max: number;
  label: string;
  onChange: (v: number) => void;
}) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(String(value));
  }, [value, focused]);

  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={max}
      aria-label={label}
      value={text}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        const n = parseInt(raw, 10);
        if (!Number.isNaN(n)) onChange(Math.max(0, Math.min(n, max)));
      }}
      className="seat-input w-12 rounded-lg border py-1 text-center text-sm font-bold tabular-nums outline-none focus:border-[var(--accent)]"
      style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
    />
  );
}

export default function Editor({
  user,
  initialSeats,
  editingId,
  initialTitle,
}: {
  user: EditorUser;
  initialSeats?: Seats | null;
  editingId?: number | null;
  initialTitle?: string;
}) {
  const { t, lang } = useI18n();
  const [seats, setSeats] = useState<Seats>(() =>
    initialSeats ? { ...defaultSeats(), ...initialSeats } : defaultSeats()
  );
  const [title, setTitle] = useState(initialTitle ?? "");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [local, setLocal] = useState<LocalPrediction[]>([]);
  const [localId, setLocalId] = useState<number | null>(null);
  const [view, setView] = useState<string | null>(null); // elección en vista só lectura
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("localPredictions") ?? "[]");
      setLocal(Array.isArray(saved) ? saved : []);
    } catch {
      setLocal([]);
    }
  }, []);

  const total = useMemo(
    () => Object.values(seats).reduce((a, b) => a + b, 0),
    [seats]
  );
  const exact = total === TOTAL_SEATS;
  const diff = TOTAL_SEATS - total;

  // Eleccións con datos para a vista de resultados (máis recente primeiro)
  const elections = useMemo(
    () =>
      Object.keys(ELECTION_RESULTS)
        .filter((k) => Object.keys(ELECTION_RESULTS[k]).length > 0)
        .sort()
        .reverse(),
    []
  );
  const viewResults = view ? (ELECTION_RESULTS[view] ?? null) : null;
  // Partidos con escaños na elección vista, ordenados por escaños
  const viewParties = useMemo(() => {
    if (!viewResults) return [];
    return PARTIES.map((p, i) => ({ p, i }))
      .filter(({ p }) => (viewResults[p.id] ?? 0) > 0)
      .sort(
        (a, b) =>
          (viewResults[b.p.id] ?? 0) - (viewResults[a.p.id] ?? 0) || a.i - b.i
      )
      .map(({ p }) => p);
  }, [viewResults]);

  const openView = (key: string) => {
    setView(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setParty = (id: string, value: number) =>
    setSeats((s) => ({
      ...s,
      [id]: Math.max(0, Math.min(Math.round(value), TOTAL_SEATS)),
    }));

  // Pon todo a 0. Tamén desvincula a predición local cargada para que
  // o seguinte gardado cree unha nova en vez de sobrescribila con ceros.
  const clearAll = () => {
    setSeats(emptySeats());
    setLocalId(null);
  };

  const notify = (msg: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const persistLocal = (list: LocalPrediction[]) => {
    setLocal(list);
    localStorage.setItem("localPredictions", JSON.stringify(list));
  };

  const saveLocal = () => {
    const entryTitle =
      title.trim() ||
      `Predición ${new Date().toLocaleDateString(lang === "gl" ? "gl-ES" : "es-ES")}`;
    if (localId !== null) {
      // Actualiza a predición local cargada en vez de crear un duplicado.
      persistLocal(
        local.map((p) => (p.id === localId ? { ...p, title: entryTitle, seats } : p))
      );
    } else {
      const entry: LocalPrediction = {
        id: Date.now(),
        title: entryTitle,
        seats,
        createdAt: new Date().toISOString(),
      };
      setLocalId(entry.id);
      persistLocal([entry, ...local]);
    }
    notify(t.saved);
  };

  const saveCloud = async () => {
    setSaving(true);
    try {
      const url = editingId ? `/api/predictions/${editingId}` : "/api/predictions";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, seats }),
      });
      if (res.ok) {
        notify(t.saved);
      } else {
        const data = await res.json().catch(() => null);
        notify(errorMessage(t, data?.message));
      }
    } catch {
      notify(t.errorGeneric);
    } finally {
      setSaving(false);
    }
  };

  const loadLocal = (entry: LocalPrediction) => {
    setSeats({ ...defaultSeats(), ...entry.seats });
    setTitle(entry.title);
    setLocalId(entry.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteLocal = (id: number) => {
    if (!window.confirm(t.confirmDelete)) return;
    if (id === localId) setLocalId(null);
    persistLocal(local.filter((p) => p.id !== id));
  };

  return (
    <div className="anim-fade-up space-y-4 px-4 py-4">
      {viewResults ? (
        <>
          {/* Vista de resultados: SÓ LECTURA */}
          <section className="card hero-card space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h2
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: "var(--muted)" }}
              >
                {view}
              </h2>
              <button
                onClick={() => setView(null)}
                className="btn btn-ghost !px-3 !py-1 text-xs"
              >
                {t.backToEdit}
              </button>
            </div>
            <Hemicycle seats={viewResults} />
            <SeatBar seats={viewResults} height="h-3.5" majorityLabel={t.majorityInfo} />
          </section>

          <section
            className="card divide-y overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >
            {viewParties.map((p, i) => (
              <div
                key={p.id}
                className="anim-fade-up flex items-center gap-2.5 px-3 py-2"
                style={{ animationDelay: `${40 + i * 25}ms`, borderColor: "var(--border)" }}
              >
                <PartyLogo party={p} />
                <span className="min-w-0 flex-1 truncate text-xs font-medium leading-tight">
                  {p.name}
                </span>
                <span className="shrink-0 text-xs tabular-nums" style={{ color: "var(--muted)" }}>
                  {(((viewResults[p.id] ?? 0) / TOTAL_SEATS) * 100).toFixed(1)}%
                </span>
                <span className="w-10 shrink-0 text-right text-lg font-extrabold tabular-nums">
                  {viewResults[p.id] ?? 0}
                </span>
              </div>
            ))}
          </section>
        </>
      ) : (
        <>
      {/* Hemiciclo + estado */}
      <section className="card hero-card space-y-3 overflow-hidden p-4">
        <Hemicycle seats={seats} />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                exact ? "" : total > TOTAL_SEATS ? "anim-pulse-danger" : ""
              }`}
              style={{
                background: exact
                  ? "color-mix(in srgb, var(--ok) 15%, transparent)"
                  : "color-mix(in srgb, var(--danger) 12%, transparent)",
                color: exact ? "var(--ok)" : "var(--danger)",
              }}
            >
              {exact
                ? t.majorityInfo
                : total > TOTAL_SEATS
                  ? `${t.over} ${-diff}`
                  : `${t.remaining} ${diff}`}
            </span>
            <div className="flex items-center gap-2">
              {!exact && total > 0 && (
                <span className="text-xs font-medium" style={{ color: "var(--danger)" }}>
                  {t.invalidSum}
                </span>
              )}
              <button
                onClick={clearAll}
                disabled={total === 0}
                className="btn btn-ghost !px-3 !py-1 text-xs"
              >
                {t.clear}
              </button>
            </div>
          </div>
          <SeatBar seats={seats} height="h-3.5" majorityLabel={t.majorityInfo} />
        </div>
      </section>

      {/* Partidos: lista compacta con input numérico, ordenada por
          escaños actuais (PARTIES_BY_SEATS). Os desactivados
          (runs: false) non se amosan. */}
      <section className="card divide-y overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {PARTIES_BY_SEATS.filter((p) => p.runs).map((p, i) => {
          const value = seats[p.id] ?? 0;
          const maxForParty = TOTAL_SEATS - (total - value);
          return (
            <div
              key={p.id}
              className="anim-fade-up flex items-center gap-2.5 px-3 py-2"
              style={{ animationDelay: `${40 + i * 20}ms`, borderColor: "var(--border)" }}
            >
              <PartyLogo party={p} />
              <span className="min-w-0 flex-1 truncate text-xs font-medium leading-tight">
                {p.name}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setParty(p.id, value - 1)}
                  disabled={value === 0}
                  className="step-btn"
                  aria-label={`${p.short} −1`}
                >
                  −
                </button>
                <SeatInput
                  value={value}
                  max={maxForParty}
                  label={p.name}
                  onChange={(v) => setParty(p.id, v)}
                />
                <button
                  onClick={() => setParty(p.id, value + 1)}
                  disabled={value >= maxForParty}
                  className="step-btn"
                  aria-label={`${p.short} +1`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Gardar */}
      <section className="card space-y-3 p-4">
        <input
          className="input"
          placeholder={t.predictionTitlePlaceholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label={t.predictionTitle}
        />
        {user ? (
          <button
            onClick={saveCloud}
            disabled={!exact || saving}
            className="btn btn-primary w-full text-base"
          >
            {saving ? t.saving : editingId ? t.update : t.save}
          </button>
        ) : (
          <>
            <button
              onClick={saveLocal}
              disabled={!exact}
              className="btn btn-primary w-full text-base"
            >
              {t.guestSave}
            </button>
            <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
              {t.guestNotice}{" "}
              <Link href="/login" className="font-semibold underline" style={{ color: "var(--accent)" }}>
                {t.loginToSave}
              </Link>
            </p>
          </>
        )}
      </section>

      {/* Predicicións locais */}
      {local.length > 0 && (
        <section className="space-y-2">
          <h2 className="px-1 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            {t.onThisDevice}
          </h2>
          {local.map((entry) => (
            <div key={entry.id} className="card anim-fade-up space-y-2 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">{entry.title}</p>
                <p className="shrink-0 text-xs tabular-nums" style={{ color: "var(--muted)" }}>
                  {new Date(entry.createdAt).toLocaleDateString(lang === "gl" ? "gl-ES" : "es-ES")}
                </p>
              </div>
              <SeatBar seats={entry.seats} />
              <div className="flex gap-2">
                <button onClick={() => loadLocal(entry)} className="btn btn-ghost flex-1 !py-1.5 text-sm">
                  {t.load}
                </button>
                <button
                  onClick={() => deleteLocal(entry.id)}
                  className="btn btn-ghost flex-1 !py-1.5 text-sm"
                  style={{ color: "var(--danger)" }}
                >
                  {t.delete}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
        </>
      )}

      {/* Resultados de eleccións anteriores */}
      {elections.length > 0 && (
        <section className="space-y-2">
          <h2 className="px-1 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            {t.pastResults}
          </h2>
          <div className="flex flex-wrap gap-2">
            {elections.map((e) => (
              <button
                key={e}
                onClick={() => openView(e)}
                className="btn btn-ghost !py-1.5 text-sm"
              >
                {e}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="anim-toast fixed bottom-6 left-1/2 z-50 rounded-full px-5 py-2.5 text-sm font-semibold shadow-xl"
          style={{ background: "var(--text)", color: "var(--bg)" }}
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
