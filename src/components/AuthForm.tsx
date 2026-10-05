"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n, errorMessage } from "@/lib/i18n";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "register" ? { name, email, password } : { email, password }
        ),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(errorMessage(t, data?.message));
      }
    } catch {
      setError(t.errorGeneric);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="anim-fade-up px-4 py-8">
      <form onSubmit={submit} className="card mx-auto max-w-sm space-y-4 p-6">
        <h1 className="text-xl font-extrabold">
          {mode === "login" ? t.login : t.register}
        </h1>

        {mode === "register" && (
          <label className="block space-y-1">
            <span className="text-sm font-medium">{t.name}</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>
        )}

        <label className="block space-y-1">
          <span className="text-sm font-medium">{t.email}</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">{t.password}</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>

        {error && (
          <p className="anim-pop rounded-lg px-3 py-2 text-sm font-medium" style={{ color: "var(--danger)", background: "color-mix(in srgb, var(--danger) 10%, transparent)" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy ? t.loading : mode === "login" ? t.login : t.register}
        </button>

        <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
          {mode === "login" ? (
            <Link href="/rexistro" className="font-semibold underline" style={{ color: "var(--accent)" }}>
              {t.noAccount}
            </Link>
          ) : (
            <Link href="/login" className="font-semibold underline" style={{ color: "var(--accent)" }}>
              {t.haveAccount}
            </Link>
          )}
        </p>
      </form>
    </div>
  );
}
