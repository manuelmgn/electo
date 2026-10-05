"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n, type Lang } from "@/lib/i18n";

type Theme = "auto" | "light" | "dark";

const themeIcons: Record<Theme, string> = {
  auto: "◐",
  light: "☀",
  dark: "☾",
};

export default function Header({ user }: { user: { name: string } | null }) {
  const { t, lang, setLang } = useI18n();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("auto");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  const cycleTheme = () => {
    const order: Theme[] = ["auto", "light", "dark"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    if (next === "auto") {
      localStorage.removeItem("theme");
      delete document.documentElement.dataset.theme;
    } else {
      localStorage.setItem("theme", next);
      document.documentElement.dataset.theme = next;
    }
  };

  const switchLang = (l: Lang) => {
    setLang(l);
    setMenuOpen(false);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setMenuOpen(false);
    router.refresh();
  };

  return (
    <header className="anim-fade-up sticky top-0 z-20 border-b" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
      <div className="mx-auto flex max-w-xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span
            className="bg-clip-text text-lg font-extrabold tracking-tight"
            style={{
              backgroundImage: "linear-gradient(90deg, var(--accent), #00C1B1)",
              color: "transparent",
            }}
          >
            {t.appName}
          </span>
          <span className="hidden text-xs sm:inline" style={{ color: "var(--muted)" }}>
            {t.tagline}
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <div
            className="flex overflow-hidden rounded-full text-xs font-bold"
            style={{ background: "var(--surface-2)" }}
            role="group"
            aria-label={t.language ?? "Idioma"}
          >
            {(["gl", "es"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => switchLang(l)}
                className="px-2.5 py-1.5 uppercase transition-opacity"
                style={
                  lang === l
                    ? { background: "var(--accent)", color: "var(--accent-contrast)" }
                    : { color: "var(--muted)" }
                }
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={cycleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
            style={{ background: "var(--surface-2)" }}
            aria-label={t.theme ?? "Tema"}
            title={theme}
          >
            {themeIcons[theme]}
          </button>

          {user ? (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
              aria-label={t.hello}
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
          ) : (
            <Link
              href="/login"
              className="btn btn-primary !px-3 !py-1.5 text-sm"
            >
              {t.login}
            </Link>
          )}
        </div>
      </div>

      {user && menuOpen && (
        <div
          className="anim-pop absolute right-3 top-14 z-30 w-48 overflow-hidden py-1 shadow-xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem" }}
        >
          <p className="px-4 py-2 text-sm font-semibold" style={{ color: "var(--muted)" }}>
            {t.hello}, {user.name}
          </p>
          <Link
            href="/predicions"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 text-sm hover:opacity-80"
          >
            {t.myPredictions}
          </Link>
          <button
            onClick={logout}
            className="block w-full px-4 py-2 text-left text-sm hover:opacity-80"
            style={{ color: "var(--danger)" }}
          >
            {t.logout}
          </button>
        </div>
      )}
    </header>
  );
}
