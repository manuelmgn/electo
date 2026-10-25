"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PARTIES, textOn } from "@/lib/parties";
import { useI18n, errorMessage, formatDate } from "@/lib/i18n";
import SeatBar from "./SeatBar";

export type PredictionDto = {
  id: number;
  title: string;
  created_at: string;
  seats: Record<string, number>;
};

export default function PredictionsClient({
  predictions,
}: {
  predictions: PredictionDto[];
}) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remove = async (id: number) => {
    if (!window.confirm(t.confirmDelete)) return;
    setDeleting(id);
    setError(null);
    try {
      const res = await fetch(`/api/predictions/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(errorMessage(t, data?.message));
      }
    } catch {
      setError(t.errorGeneric);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="anim-fade-up space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">{t.myPredictions}</h1>
        <Link href="/" className="btn btn-ghost !py-1.5 text-sm">
          + {t.save}
        </Link>
      </div>

      {predictions.length === 0 && (
        <p className="card p-6 text-center text-sm" style={{ color: "var(--muted)" }}>
          {t.noPredictions}
        </p>
      )}

      {error && (
        <p
          className="anim-pop rounded-lg px-3 py-2 text-sm font-medium"
          style={{
            color: "var(--danger)",
            background: "color-mix(in srgb, var(--danger) 10%, transparent)",
          }}
          role="alert"
        >
          {error}
        </p>
      )}

      {predictions.map((pred, i) => {
        // Chips coa reparte: máximo 8, resto numérico oculto.
        const top = PARTIES.filter((p) => (pred.seats[p.id] ?? 0) > 0).sort(
          (a, b) => (pred.seats[b.id] ?? 0) - (pred.seats[a.id] ?? 0)
        );
        const shown = top.slice(0, 8);
        const hidden = top.length - shown.length;
        return (
          <article
            key={pred.id}
            className="card anim-fade-up space-y-3 p-4"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-bold">{pred.title}</h2>
              <span className="shrink-0 text-xs" style={{ color: "var(--muted)" }}>
                {formatDate(pred.created_at, lang)}
              </span>
            </div>

            <SeatBar seats={pred.seats} height="h-4" majorityLabel={t.majorityInfo} />

            <div className="flex flex-wrap gap-1.5">
              {shown.map((p) => (
                <span
                  key={p.id}
                  className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ background: p.color, color: textOn(p.color) }}
                >
                  {p.short} {pred.seats[p.id]}
                </span>
              ))}
              {hidden > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                >
                  +{hidden}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Link
                href={`/?cargar=${pred.id}`}
                className="btn btn-ghost flex-1 !py-1.5 text-sm"
              >
                {t.load}
              </Link>
              <button
                onClick={() => remove(pred.id)}
                disabled={deleting === pred.id}
                className="btn btn-ghost flex-1 !py-1.5 text-sm"
                style={{ color: "var(--danger)" }}
              >
                {deleting === pred.id ? t.loading : t.delete}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
