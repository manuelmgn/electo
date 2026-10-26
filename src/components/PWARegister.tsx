"use client";

import { useEffect } from "react";

// Rexistra o service worker (public/sw.js) só en produción: en dev
// as recargas frecuentes e a caché do SW atrapallan máis que axudan.
export default function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sen rexistro: a app funciona igual (é unha mellora optativa).
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
