import { expect, test, type Page } from "@playwright/test";

// ============================================================
// TESTS E2E (Playwright)
// ------------------------------------------------------------
// Corren contra o build de produción sen POSTGRES_URL: a app
// funciona no modo localStorage. Comproban o funcionamento real
// na interface: editor, persistencia local, idioma, tema, PWA
// e as páxinas públicas.
// ============================================================

// Espera a que o hemiciclo remate de montar (os asentos animan ao
// entrar; o ensamblado tarda un fotograma e medio, non inmediato).
async function esperarHemiciclo(page: Page) {
  await expect
    .poll(() => page.locator(".hero-card svg g").count(), { timeout: 10_000 })
    .toBe(350);
}

test.describe("Electo 26", () => {
  test("home carga o hemiciclo cos 350 asentos", async ({ page }) => {
    await page.goto("/");
    await esperarHemiciclo(page);
    // A suma por defecto é exacta: o chip indica a maioría absoluta.
    await expect(page.getByText("Maioría absoluta: 176")).toBeVisible();
  });

  test("+1/−1 dun partido reflicte o estado do hemiciclo", async ({ page }) => {
    await page.goto("/");
    await esperarHemiciclo(page);

    // Con o reparto por defecto (350 exactos) os "+" están ao tope
    // (ningún partido pode sumar máis). Limpar primeiro: total 0 →
    // hemiciclo baleiro e aviso de asentos restantes.
    await page.getByRole("button", { name: "Limpar" }).click();
    await expect(page.locator(".hero-card svg g")).toHaveCount(0);
    // "Restan" sae no chip do hemiciclo e na tarxeta de goberno:
    // aimos ao primeiro sempre que o número sexa o agardado.
    await expect(page.getByText("Restan 350").first()).toBeVisible();

    // +1 do PP (agora activado): 1 asento pintado e resto restado.
    await page.getByRole("button", { name: "PP +1" }).click();
    await expect(
      page.locator(".hero-card svg text").filter({ hasText: "1" }).first()
    ).toBeVisible();
    await expect(page.getByText("Restan 349").first()).toBeVisible();
    await expect(page.getByLabel("Partido Popular")).toHaveValue("1");

    // Introducir a man os 350: de novo exacto e permitido o + disabled.
    await page.getByLabel("Partido Popular").fill("350");
    await expect(page.getByText("Maioría absoluta: 176")).toBeVisible();
    await expect(page.getByRole("button", { name: "PP +1" })).toBeDisabled();

    // O −1 devolve 349 e a suma deixa de ser exacta.
    await page.getByRole("button", { name: "PP −1" }).click();
    await expect(page.getByText("Restan 1").first()).toBeVisible();
  });

  test("marcas de goberno/aliado actívanse nos botóns", async ({ page }) => {
    await page.goto("/");
    await esperarHemiciclo(page);

    // Con asentos o partido mostra a parella 🏛️/🤝: marcaxo o goberno
    // do PP e despois consello de que a marca (aria-pressed) queda.
    const govPP = page.getByRole("button", { name: "Goberno", exact: true }).first();
    await govPP.click();
    await expect(govPP).toHaveAttribute("aria-pressed", "true");
  });

  test("predición local persiste no dispositivo (localStorage)", async ({ page }) => {
    await page.goto("/");
    await esperarHemiciclo(page);

    await page.getByLabel("Título").fill("Proba E2E");
    await page.getByRole("button", { name: "Gardar no dispositivo" }).click();
    await expect(page.getByText("Proba E2E")).toBeVisible();

    // Recargar: a predición sobrevive (localStorage do navegador).
    await page.reload();
    await esperarHemiciclo(page);
    // "Neste dispositivo" aparece en dous sitios (lista e aviso de
    // guest no botón): aten ao heading da sección.
    await expect(
      page.getByRole("heading", { name: "Neste dispositivo" })
    ).toBeVisible();

    await page.evaluate(() => localStorage.clear());
  });

  test("compartir copia a ligazón e amosa a notificación", async ({ page }) => {
    await page.goto("/");
    await esperarHemiciclo(page);

    // Sen POSTGRES_URL, o share recáchese no hash base64url local.
    // WebKit non soporta grantPermissions de clipboard: falla a copia
    // pero o fluxo ten que rematar coa súa notificación (erro ou éxito).
    try {
      await page
        .context()
        .grantPermissions(["clipboard-read", "clipboard-write"], { origin: page.url() });
    } catch {
      // sen permisos: navigator.clipboard pode rexeitar igualmente
    }
    const shareButton = page.getByRole("button", { name: "Compartir" });
    await expect(shareButton).toBeEnabled();
    await shareButton.click();
    // Debe saír unha das notizacións de share (copiada —nube ou
    // fallback— ou erro ao copiar).
    await expect(
      page.getByText(/Ligazón copiada|Non se puido copiar/).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test("troco de idioma gl → es persiste", async ({ page }) => {
    await page.goto("/");
    // O placeholder do título é distinto en cada lingua (visible tamén
    // no móbil, ao contrario do tagline escondido en viewport estreito).
    const input = page.getByLabel("Título");
    await expect(input).toHaveAttribute("placeholder", "Ex.: maioría PP–Vox");

    await page.getByRole("button", { name: "es", exact: true }).click();
    await expect(input).toHaveAttribute("placeholder", "Ej.: mayoría PP–Vox");
    await expect
      .poll(() => page.evaluate(() => document.documentElement.lang))
      .toBe("es");

    // Persiste tras recargar (localStorage "lang").
    await page.reload();
    await expect(page.getByLabel("Título")).toHaveAttribute(
      "placeholder",
      "Ej.: mayoría PP–Vox"
    );
    await page.evaluate(() => localStorage.removeItem("lang"));
  });

  test("tema claro/escuro gárdase e sobrevive á recarga", async ({ page }) => {
    await page.goto("/");
    const themeBtn = page.getByRole("button", { name: /Tema: / });
    // Estado inicial: "Automático" (title do botón). Clicar leva a
    // "Claro": data-theme no documento e localStorage.
    await expect(themeBtn).toHaveAttribute("title", "Automático");
    await themeBtn.click();
    await expect(themeBtn).toHaveAttribute("title", "Claro");
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme))
      .toBe("light");
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("theme")))
      .toBe("light");

    // Tras recargar, o themeInit do layout restitúe light antes da
    // primeira pintada (sen parpadeo a auto).
    await page.reload();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme))
      .toBe("light");

    await page.evaluate(() => localStorage.removeItem("theme"));
  });

  test("404 propia en galego", async ({ page }) => {
    const res = await page.goto("/non-existe-350");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("Esta páxina non ten escaños")).toBeVisible();
    await expect(page.getByText("Voltar ao editor")).toBeVisible();
  });

  test("manifest.webmanifest servido como PWA", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.status()).toBe(200);
    const manifest = (await res.json()) as { name: string; icons: unknown[] };
    expect(manifest.name).toContain("Electo 26");
    expect(manifest.icons.length).toBeGreaterThan(1);
  });

  test("robots.txt bloquea /s/ e /api/", async ({ request }) => {
    const res = await request.get("/robots.txt");
    const body = await res.text();
    expect(res.status()).toBe(200);
    expect(body).toContain("Disallow: /s/");
    expect(body).toContain("Disallow: /api/");
    expect(body).toContain("Allow: /");
  });

  test("vista pública de resultados prerender co hemiciclo", async ({ page }) => {
    await page.goto("/r/2023");
    await esperarHemiciclo(page);
  });

  test("service worker rexistrado en produción", async ({ page }) => {
    await page.goto("/");
    // En prod (npm start) o PWARegister rexistra public/sw.js.
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            navigator.serviceWorker
              .getRegistrations()
              .then((regs) => regs.length > 0 && regs.every((r) => r.active !== null))
          ),
        { timeout: 10_000 }
      )
      .toBe(true);
  });

  test("fóra de liña amosa a páxina sin-conexion", async ({ page, browserName }) => {
    // WebKit pecha con erro interno o reload fóra de liña: queda
    // cuberto pola suite de Chromium.
    test.skip(browserName !== "chromium", "WebKit falla o reload offline");
    await page.goto("/");
    await esperarHemiciclo(page);
    // O SW controla a páxina tras a recarga; en adiante unha navegación
    // sen rede cae en /sin-conexion.html (precacheada na instalación).
    await page.reload();
    await page.context().setOffline(true);
    try {
      await page.reload();
      await expect(page.getByText("Sen conexión")).toBeVisible({ timeout: 5_000 });
    } finally {
      await page.context().setOffline(false);
    }
  });
});
