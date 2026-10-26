// ============================================================
// SERVICE WORKER DE ELECTO 26
// ------------------------------------------------------------
// Caché conservadora, sen lóxica da app:
// - Precarga: páxina fóra de liña + iconas + manifest.
// - Navegacións: rede primeiro; sen rede, páxina sin-conexion.html
//   (non se cachean HTML: as páxinas son dinámicas e mudarían dun
//   día para outro).
// - Estáticos inmutables (_next/static), logos, icona e fotos:
//   caché primeiro, gardándose a medida que se usan.
// - As chamadas /api/ nunca se interceden (deben fallar eixo a app
//   xestiona o erro e recae en localStorage).
// Cando se mude algo aquí, sobe a versión: libera cachés antigas.
// ============================================================

const VERSION = "v1";
const STATIC_CACHE = `electo-static-${VERSION}`;
const RUNTIME_CACHE = `electo-runtime-${VERSION}`;
const OFFLINE_URL = "/sin-conexion.html";

const PRECACHE = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Estáticos que convén cachear ao voo (logos dos partidos, imaxes OG).
function isImageAsset(url) {
  return (
    url.pathname.startsWith("/logos/") ||
    ["/logo.png", "/electo-social.png", "/icon-192.png", "/icon-512.png"].includes(
      url.pathname
    )
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Só mesma orixe: asAnalytics e o resto non nos toca.
  if (url.origin !== self.location.origin) return;
  // API: sempre rede (sen intercesión). Erros de conexión tráitalos
  // os compoñentes client-side.
  if (url.pathname.startsWith("/api/")) return;

  // Navegacións (HTML): rede primeiro, fóra de liña → sin-conexion.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Estáticos inmutables do build: caché primeiro.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
            return res;
          })
      )
    );
    return;
  }

  // Imaxes dos partidos e icona: caché primeiro, actualizada ao uso.
  if (isImageAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
            return res;
          })
      )
    );
  }
});
