# Electo 26

App de predicicións para as eleccións xerais de España 2026: cada usuario
reparte os **350 escaños** entre os partidos e garda as súas predicicións.
Login optativo (sen sesión, gárdase no dispositivo), galego/castelán e
tema claro/oscuro automático. Optimizada para móbil.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Vercel Postgres / Neon** co driver `postgres` (postgres.js, JS puro
  sen dependencias nativas)
- **Tailwind CSS 4**
- Sesións con cookie HTTP-only asinada con HMAC (sen dependencias de auth)

## Estrutura

| Ruta | Descrición |
|---|---|
| `/` | Editor de escaños + vistas de resultados anteriores |
| `/login`, `/rexistro` | Acceso e rexistro |
| `/predicions` | Listado das predicicións gardadas na nube |
| `src/lib/parties.ts` | **Táboa única de partidos** (siglas, cor, logo, axis, runs, seats) |
| `src/lib/results.ts` | **Resultados de eleccións anteriores** (só lectura) |
| `src/lib/dictionaries.ts` | Textos en galego e castelán |
| `tests/` | Testes unitarios (Vitest) |
| `scripts/schema.sql` | Esquema da base de datos |

## Partidos

Para engadir, quitar ou modificar partidos edita **`src/lib/parties.ts`**:
é a única táboa que necesitas tocar. Cada partido ten `id` (non o cambies se
hai predicicións gardadas), `name`, `short` (siglas), `color`, `logo`
(nome do ficheiro dentro de `/public/logos/`; se non existe, móstranse as
siglas), `axis` (posición no eixo esquerda-dereita, **enteiro entre -3 e 3**;
decide a posición no hemiciclo e na barra: canto maior, máis á dereita),
`runs` (`true` se se presenta; os `false` non aparecen na vista editable
pero si nas vistas de resultados se teñen datos) e `seats` (escaños que se
amosan por defecto ao cargar a app, totalmente modificables; tamén ordena
a lista do editor).

Os resultados de eleccións anteriores (vistas só lectura que se cargan dende
o fondo da páxina principal) edítanse en **`src/lib/results.ts`**.

## Desenvolvemento local

```bash
npm install
cp .env.example .env.local   # e enche os valores
npm run dev
```

Necesitas un `POSTGRES_URL` (podes crear un Vercel Postgres e copiar a
cadea de conexión "local" do dashboard) e un `SESSION_SECRET`
(`openssl rand -base64 32`).

## Despregamento en Vercel

1. Sube o código a GitHub/GitLab e impórtao en [vercel.com/new](https://vercel.com/new)
   (Vercel detecta Next.js automaticamente).
2. No teu proxecto: **Storage → Create Database → Postgres**. Vercel crea a
   variable `POSTGRES_URL` automaticamente.
3. Na pestana **Query** (ou coa consola SQL) executa o contido de
   `scripts/schema.sql`.
4. En **Settings → Environment Variables** engade `SESSION_SECRET`
   (`openssl rand -base64 32`).
5. **Redeploy**. Listo.

## Notas

- A suma debe ser **exactamente 350** para poder gardar.
- O login é optativo: sen sesión as predicicións gárdanse en
  `localStorage` do dispositivo.
- Para engadir máis idiomas, engade o dicionario en
  `src/lib/dictionaries.ts` e o código en `src/lib/i18n.ts`.
- Tests: `npm test` (Vitest, lóxica pura: hemiciclo, sesións,
  validación de asentos e táboas).
