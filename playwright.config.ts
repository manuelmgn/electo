import { defineConfig, devices } from "@playwright/test";

// ============================================================
// CONFIGURACIÓN PLAYWRIGHT (tests E2E)
// ------------------------------------------------------------
// Corren contra o build de produción (build + next start) no
// porto 3100, é o mesmo despregamento que Vercel, co PWA
// rexistrado. Os tests executan sen POSTGRES_URL, así que a app
// roda no modo localStorage (sen sesión na nube).
// ============================================================

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "line",
  use: {
    // Porto propio: evita reutilizar accidentalmente o `npm run dev`
    // do programador en :3000 (en dev non se rexistra o SW e o
    // comportamento non é o de produción).
    baseURL: "http://localhost:3100",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    // Build novo en cada pasada: os tests non teñen que mercar
    // diferenzas co código na árbore de traballo. Fórzase POSTGRES_URL
    // baleiro: se un día existe .env.local con BD, os tests seguen en
    // modo localStorage (deterministas, non tocan a base de datos).
    command: "export POSTGRES_URL= PORT=3100 E2E_DIST=1 && npm run build && npm start",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Móbil: a app está optimizada para móbil, vale a pena cubrila.
    {
      name: "mobile",
      use: { ...devices["iPhone 13"] },
    },
  ],
});
