"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PARTIES, PARTIES_BY_SEATS, TOTAL_SEATS, allyShade, governmentShade, governmentSumColor } from "@/lib/parties";
import { ELECTION_VIEWS, FORECAST_VIEWS } from "@/lib/views";
import { encodeShare, decodeShare, buildShareLines } from "@/lib/share";
import { useI18n, errorMessage } from "@/lib/i18n";
import SeatBar from "./SeatBar";
import GovBar, { ALLY_HATCH } from "./GovBar";
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

// Valores por defecto do editor: o campo `seats` de cada partido
// (totalmente modificables), limitados aos que se presentan
// (runs: true). O botón "Limpar" pon todo a 0.
function defaultSeats(): Seats {
  return Object.fromEntries(
    PARTIES.map((p) => [p.id, p.runs ? p.seats : 0])
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
  const [governs, setGoverns] = useState<Record<string, boolean>>({});
  const [allies, setAllies] = useState<Record<string, boolean>>({});
  const [title, setTitle] = useState(initialTitle ?? "");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState(false); // aviso de ligazón copiada
  const [local, setLocal] = useState<LocalPrediction[]>([]);
  const [localId, setLocalId] = useState<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const shareTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("localPredictions") ?? "[]");
      setLocal(Array.isArray(saved) ? saved : []);
    } catch {
      setLocal([]);
    }
  }, []);

  // Ligazón de compartición: se a URL trae código no hash (#p=...),
  // cárganse eses resultados no editor e límpase o hash da URL.
  useEffect(() => {
    const m = window.location.hash.match(/(?:^#|#|&)p=([A-Za-z0-9_-]+)/);
    if (!m) return;
    const shared = decodeShare(m[1]);
    if (shared) {
      // Sobre cero: o código omitiu os partidos con 0 escaños.
      setSeats({ ...emptySeats(), ...shared.seats });
      setGoverns(shared.governs);
      setAllies(shared.allies);
      setLocalId(null);
    }
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  const total = useMemo(
    () => Object.values(seats).reduce((a, b) => a + b, 0),
    [seats]
  );
  const exact = total === TOTAL_SEATS;
  const diff = TOTAL_SEATS - total;

  // Eleccións e pronósticos con vista de só lectura propia (máis
  // recente primeiro). As vistas viven nas rutas /r/[slug] e /f/[slug].
  const elections = useMemo(
    () =>
      Object.values(ELECTION_VIEWS)
        .sort((a, b) => b.key.localeCompare(a.key))
        .map((v) => ({ slug: v.slug, key: v.key })),
    []
  );
  const forecasts = useMemo(
    () =>
      Object.values(FORECAST_VIEWS)
        .sort((a, b) => b.key.localeCompare(a.key))
        .map((v) => ({ slug: v.slug, key: v.key })),
    []
  );

  // Partidos marcados como gobernantes no editor, ordenados polos
  // escaños actuais (o maior leva a tonalidade de verde máis intensa).
  const governmentRanks = useMemo(() => {
    const ids = PARTIES_BY_SEATS.filter((p) => governs[p.id])
      .sort((a, b) => (seats[b.id] ?? 0) - (seats[a.id] ?? 0))
      .map((p) => p.id);
    return Object.fromEntries(
      ids.map((id, i) => [id, { rank: i, total: ids.length }])
    );
  }, [governs, seats]);

  // Cor do partido gobernante con máis escaños: mostra na leyenda da
  // barra o "cor de partido" (goberno vai sen trama; aliados, con ela).
  const topGovColor = useMemo(() => {
    const top = PARTIES.filter((p) => governs[p.id] && (seats[p.id] ?? 0) > 0)
      .sort((a, b) => (seats[b.id] ?? 0) - (seats[a.id] ?? 0))[0];
    return top?.color ?? governmentShade(0, 1);
  }, [governs, seats]);

  // Marca un partido como goberno ou aliado (ou desmárcao co mesmo
  // clic). Os dous roles son mutuamente excluíntes.
  const setRole = (id: string, role: "gov" | "ally") => {
    const current = governs[id] ? "gov" : allies[id] ? "ally" : null;
    const next = current === role ? null : role;
    setGoverns((g) => ({ ...g, [id]: next === "gov" }));
    setAllies((a) => ({ ...a, [id]: next === "ally" }));
  };

  // Suma de escaños dos partidos marcados como gobernantes ou aliados
  // e cor do indicador segundo os rangos establecidos.
  const govTotal = useMemo(
    () =>
      PARTIES.reduce(
        (acc, p) =>
          acc + (governs[p.id] || allies[p.id] ? (seats[p.id] ?? 0) : 0),
        0
      ),
    [governs, allies, seats]
  );
  const govColor = governmentSumColor(govTotal);

  const openView = (key: string, type: "election" | "forecast") => {
    setView(key);
    setViewType(type);
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
    setGoverns({});
    setAllies({});
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

  // Copia no portapapeis un texto co prognóstico (top partidos + 🏛️
  // goberno + 🤝 aliados) e a ligazón co estado codificado no hash, que
  // garda os resultados por si mesma. (Integración co menú de compartir
  // do navegador/sistema: pendente.)
  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#p=${encodeShare(seats, governs, allies)}`;
    const text = `${t.shareTextTitle}\n\n${buildShareLines(seats, governs, allies, PARTIES).join("\n")}\n\n${url}`;
    try {
      await navigator.clipboard.writeText(text);
      if (shareTimer.current !== null) window.clearTimeout(shareTimer.current);
      setShareNotice(true);
      shareTimer.current = window.setTimeout(() => setShareNotice(false), 3200);
    } catch {
      notify(t.shareError);
    }
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

          {/* Suma de goberno + aliados daquela lexislatura: mesma estrutura
              ca na vista de edición (tarxeta coa fila de insignia + leyenda
              e a barra debaixo), coa liña da maioría. Só se amosa se hai
              algún partido marcado. */}
          {viewGovTotal > 0 && (
            <section className="card space-y-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    background: `color-mix(in srgb, ${governmentSumColor(viewGovTotal)} 15%, transparent)`,
                    color: governmentSumColor(viewGovTotal),
                  }}
                >
                  {t.government}: {viewGovTotal}
                </span>
                <div
                  className="flex shrink-0 items-center gap-3 text-[11px] font-semibold"
                  style={{ color: "var(--muted)" }}
                >
                  <span className="flex items-center gap-1">
                    <span
                      aria-hidden="true"
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ background: viewTopGovColor }}
                    />
                    🏛️ {t.government}
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      aria-hidden="true"
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: viewTopGovColor, backgroundImage: ALLY_HATCH }}
                    />
                    🤝 {t.ally}
                  </span>
                </div>
              </div>
              <GovBar seats={viewResults} governs={viewGovs} allies={viewAllies} />
            </section>
          )}

          <section
            className="card divide-y overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >
            {viewParties.map((p, i) => {
              const gov = viewGovRanks[p.id];
              const ally = viewAllies[p.id];
              const shade = gov ? governmentShade(gov.rank, gov.total) : "";
              const badgeColor = gov ? shade : allyShade();
              return (
              <div
                key={p.id}
                className="anim-fade-up flex items-center gap-2.5 px-3 py-2"
                style={{
                  animationDelay: `${40 + i * 25}ms`,
                  borderColor: "var(--border)",
                  background: gov || ally
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
                <span className="w-12 shrink-0 text-right text-xs tabular-nums" style={{ color: "var(--muted)" }}>
                  {(((viewResults[p.id] ?? 0) / TOTAL_SEATS) * 100).toFixed(1)}%
                </span>
                <span className="w-10 shrink-0 text-right text-lg font-extrabold tabular-nums">
                  {viewResults[p.id] ?? 0}
                </span>
              </div>
              );
            })}
          </section>
        </>
      ) : (
        <>
      {/* Hemiciclo + estado */}
      <section className="card hero-card space-y-3 overflow-hidden p-4">
        <Hemicycle seats={seats} />

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
      </section>

      {/* Barra da suma de goberno: os partidos marcados van sumando
          segmentos (goberno primeiro, despois aliados) ata a liña da
          maioría. A leyenda vai arriba á dereita. */}
      <section className="card space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span
            className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold"
            style={{
              background: `color-mix(in srgb, ${govColor} 15%, transparent)`,
              color: govColor,
            }}
          >
            {t.government}: {govTotal}
            {!exact && (
              <span style={{ color: "var(--muted)" }}>
                {total > TOTAL_SEATS
                  ? `${t.over} ${-diff}`
                  : `${t.remaining} ${diff}`}
              </span>
            )}
          </span>
          <div
            className="flex shrink-0 items-center gap-3 text-[11px] font-semibold"
            style={{ color: "var(--muted)" }}
          >
            <span className="flex items-center gap-1">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: topGovColor }}
              />
              🏛️ {t.government}
            </span>
            <span className="flex items-center gap-1">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: topGovColor, backgroundImage: ALLY_HATCH }}
              />
              🤝 {t.ally}
            </span>
          </div>
        </div>
        <GovBar seats={seats} governs={governs} allies={allies} />
      </section>

      {/* Partidos: lista compacta con input numérico, ordenada polos
          escaños por defecto (PARTIES_BY_SEATS). Os desactivados
          (runs: false) non se amosan. */}
      <section className="card divide-y overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {PARTIES_BY_SEATS.filter((p) => p.runs).map((p, i) => {
          const value = seats[p.id] ?? 0;
          const maxForParty = TOTAL_SEATS - (total - value);
          const gov = governmentRanks[p.id];
          const shade = gov ? governmentShade(gov.rank, gov.total) : "";
          const ally = !gov && allies[p.id];
          const aShade = allyShade();
          return (
            <div
              key={p.id}
              className="anim-fade-up flex items-center gap-2.5 px-3 py-2"
              style={{
                animationDelay: `${40 + i * 20}ms`,
                borderColor: "var(--border)",
                background: gov
                  ? `color-mix(in srgb, ${shade} 20%, transparent)`
                  : ally
                    ? `color-mix(in srgb, ${aShade} 18%, transparent)`
                    : undefined,
              }}
            >
              <PartyLogo party={p} />
              <span className="min-w-0 flex-1 truncate text-xs font-medium leading-tight">
                <span className="sm:hidden">{p.short}</span>
                <span className="hidden sm:inline">{p.name}</span>
              </span>
              {value > 0 && (
                /* Dous botóns pegados (control segmentado): goberno ou
                   aliado, mutuamente excluíntes. En pantallas estreitas
                   amósanse só os emojis, máis grandes. */
                <div
                  className="flex shrink-0 overflow-hidden rounded-lg border text-base font-bold leading-none sm:text-[11px]"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    onClick={() => setRole(p.id, "gov")}
                    aria-pressed={!!gov}
                    aria-label={t.government}
                    title={t.government}
                    className={`px-2.5 py-2 transition-opacity sm:px-1.5 sm:py-1 ${
                      gov ? "" : "opacity-45 hover:opacity-80"
                    }`}
                    style={
                      gov
                        ? {
                            background: `color-mix(in srgb, ${shade} 85%, black)`,
                            color: "#fff",
                          }
                        : undefined
                    }
                  >
                    🏛️<span className="hidden sm:inline"> {t.government}</span>
                  </button>
                  <button
                    onClick={() => setRole(p.id, "ally")}
                    aria-pressed={!!ally}
                    aria-label={t.ally}
                    title={t.ally}
                    className={`border-l px-2.5 py-2 transition-opacity sm:px-1.5 sm:py-1 ${
                      ally ? "" : "opacity-45 hover:opacity-80"
                    }`}
                    style={{
                      ...(ally
                        ? {
                            background: `color-mix(in srgb, ${aShade} 85%, black)`,
                            color: "#fff",
                          }
                        : undefined),
                      borderColor: "var(--border)",
                    }}
                  >
                    🤝<span className="hidden sm:inline"> {t.ally}</span>
                  </button>
                </div>
              )}
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

      {/* Gardar: o botón principal é o de compartir (vaí primeiro e
          destacado); gardar queda como secundario. */}
      <section className="card space-y-3 p-4">
        <button
          onClick={share}
          disabled={!exact}
          className="btn btn-primary w-full text-base"
        >
          {t.share}
        </button>
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
            className="btn btn-ghost w-full text-base"
          >
            {saving ? t.saving : editingId ? t.update : t.save}
          </button>
        ) : (
          <>
            <button
              onClick={saveLocal}
              disabled={!exact}
              className="btn btn-ghost w-full text-base"
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
                onClick={() => openView(e, "election")}
                className="btn btn-ghost !py-1.5 text-sm"
              >
                {e}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Pronósticos precargados (só os marcados como publicados) */}
      {forecasts.length > 0 && (
        <section className="space-y-2">
          <h2 className="px-1 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            {t.forecasts}
          </h2>
          <div className="flex flex-wrap gap-2">
            {forecasts.map((f) => (
              <button
                key={f}
                onClick={() => openView(f, "forecast")}
                className="btn btn-ghost !py-1.5 text-sm"
              >
                {f}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Aviso superior: ligazón copiada (desaparece só) */}
      {shareNotice && (
        <div
          className="anim-toast fixed left-1/2 top-4 z-50 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-xl"
          style={{ background: "var(--ok)", color: "var(--bg)" }}
          role="status"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {t.shareCopied}
        </div>
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
