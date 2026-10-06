# Instrucións do proxecto

- **COMMITEA SIEMPRE**: tras cada cambio (ou conxunto de cambios coherentes),
  crea un commit con `git commit`. Non deixes o traballo sen commitear.

## Descrición

**Electo 26**: app web para predicir as eleccións xerais de España 2026. Cada
usuario reparte os **350 escaños** do Congreso entre os partidos e garda as
súas predicicións. Inclúe un hemiciclo visual, marcación de goberno/aliados,
compartición por ligazón, login optativo (sen sesión, gárdase en
`localStorage` do dispositivo), galego/castelán e tema claro/oscuro
automático. Optimizada para móbil.

## Stack

- **Next.js 15** (App Router, TypeScript strict) + **React 19**
- **Tailwind CSS 4** (`@tailwindcss/postcss`, ver `postcss.config.mjs` e
  `src/app/globals.css`)
- **Vercel Postgres / Neon** co driver `postgres` (postgres.js, JS puro sen
  dependencias nativas; conecta con `prepare: false` por compatibilidade co
  pooler PgBouncer). Ver `src/lib/db.ts`.
- **bcryptjs** para hash de contrasinais
- Sesións sen librería de auth: cookie HTTP-only asinada con **HMAC-SHA256**
  (`src/lib/session.ts`, cookie `electo_session`, 30 días)
- **Vitest** para tests

## Comandos

```bash
npm install
npm run dev     # servidor de desenvolvemento
npm run build   # build de produción
npm start       # servir o build
npm test        # tests unitarios (vitest run)
```

Desenvolvemento local: `cp .env.example .env.local` e enche `POSTGRES_URL` e
`SESSION_SECRET` (`openssl rand -base64 32`). A app funciona sen base de
datos (garda en `localStorage`), pero rexistro/login/predicicións na nube
precisan `POSTGRES_URL`.

Despregamento: Vercel (detecta Next.js automaticamente). Crea Postgres en
**Storage → Create Database**, executa `scripts/schema.sql` na pestana Query
e engade `SESSION_SECRET` en Environment Variables.

## Estrutura

```
src/
  app/                  # App Router
    page.tsx            # páxina principal (editor + ligazóns a vistas)
    r/[slug]/           # vista de só lectura dun resultado electoral
                        # (/r/2023, /r/2019-ii…); metadatos + OG propios
    f/[slug]/           # igual para pronósticos publicados
    s/[code]/           # predición compartida: código de 20 caracteres
                        # alfanuméricos único e inmutable (gárdase en BD)
    login/, rexistro/   # páxinas de auth
    predicions/         # listado de predicicións na nube
    api/auth/{login,register,logout}/route.ts
    api/predictions/route.ts e api/predictions/[id]/route.ts
    api/share/route.ts  # crea a ligazón curta /s/<código> (POST)
  components/           # client components: Editor, ResultsView (vista
                        # só lectura compartida polas rutas r/f/s),
                        # Hemicycle, SeatBar, GovBar, Header, AuthForm,
                        # PartyLogo, PredictionsClient
  lib/
    parties.ts          # TÁBOA ÚNICA DE PARTIDOS (ver abaixo)
    results.ts          # resultados de eleccións anteriores (só lectura)
    forecasts.ts        # pronósticos precargados; campo `published`
                        # (true/false) decide se se amosan publicamente
    views.ts            # slugs e vistas de só lectura (r/f) construídos
                        # dende results.ts/forecasts.ts; viewSummary
    hemicycle.ts        # xeneración xeométrica dos asentos do hemiciclo
    predictions.ts      # validación do reparto (súa exacta = 350) + SQL
    share.ts            # codificación base64url (#p=...) e
                        # generateShareCode() (20 caracteres alfanuméricos)
    session.ts, auth.ts # tokens de sesión e usuario da sesión
    db.ts               # cliente postgres.js
    dictionaries.ts     # textos gl/es
    i18n.ts             # hook useI18n + detección de idioma
tests/                  # tests Vitest (lóxica pura, sen DB nin DOM)
scripts/schema.sql      # esquema: users, predictions, prediction_seats,
                        # shared_predictions
public/logos/           # logos dos partidos (nomes referenciados dende parties.ts)
```

## Convencións clave

### Táboa de partidos (`src/lib/parties.ts`)

É a **única táboa** para engadir/quitar/modificar partidos. Cada partido
ten: `id` (estable, non o cambies se hai predicicións gardadas), `name`,
`order`, `short` (siglas), `color` (hex), `logo` (ficheiro en
`/public/logos/`; se non existe, móstranse as siglas), `seats` (escaños por
defecto do editor; tamén ordena a lista), `axis` (enteiro **-3 a 3**,
esquerda→dereita; decide a posición no hemiciclo e na barra), `runs`
(`false` = non aparece na vista editable, pero si nas vistas de resultados)
e `emoji`.

Constantes exportadas: `TOTAL_SEATS = 350`, `MAJORITY_SEATS = 176`,
`PARTIES`, `PARTIES_BY_SEATS`, e funcións de cor (`governmentShade`,
`governmentSumColor`, `textOn`, `axisValue`).

### Resultados anteriores (`src/lib/results.ts`)

`ELECTION_RESULTS` (id partido → escaños por elección),
`ELECTION_GOVERNMENT` e `ELECTION_ALLIES` (mesmas claves). Só alimenta as
vistas de só lectura; os ids deben coincidir cos de `parties.ts`.

### i18n

Idiomas en `src/lib/dictionaries.ts` (`gl`, `es`) e códigos en
`src/lib/i18n.ts` (`Lang = "gl" | "es"`). Para engadir idioma: novo
dicionario + entrada en `dicts` de `i18n.ts`. As mensaxes de erro das API
devolven claves de dicionario (`errorMessage` tradúceas no cliente).

### Estilo de código

- TypeScript strict; alias de importación `@/` → `src/` (configurado en
  `tsconfig.json` e `vitest.config.ts`).
- Comentarios e mensaxes de commit en **galego**.
- API routes: validan sempre o body, devolven JSON con clave `message`
  (traducíbel) e comproban `dbConfigured()` antes de tocar a BD.
- Componentes interactivos: `"use client"` no topo.
- Sen ORM: SQL con tagged templates de `postgres` (seguro contra inxección).
- Non engadas dependencias novas sen necesidade real; o stack é mínimo a
  propósito (driver de BD e auth feitos a man, sen dependencias nativas).

## Tests

`npm test` (Vitest). Cubren só lóxica pura, sen base de datos nin DOM:
hemiciclo (`buildSeats`), validación de escaños, sesións (`parseSession`,
HMAC, expiración), táboas de partidos, vistas de só lectura (slugs en
`src/lib/views.ts`) e compartición (`encodeShare` / `decodeShare` /
`buildShareLines` / `generateShareCode`). Os tests usan o alias `@/` e viven
en `tests/**/*.test.ts`. Ao modificar a lóxica de `src/lib`, actualiza ou
engade tests no mesmo PR/commit.

## Seguridade

- `SESSION_SECRET` obrigatorio en produción (en local hai un fallback de
  desenvolvemento marcado no código, non o uses en prod).
- Contrasinais con bcrypt (10 rondas); cookie de sesión `HttpOnly;
  SameSite=Lax`.
- Verificación de sinatura de sesión con `crypto.timingSafeEqual`.
- Nunca commitees `.env.local`; só `.env.example` (xa no repo) como
  referencia.
- Todas as consultas SQL usan parámetros (`postgres` tagged templates).

## Notas

- A suma de escaños debe ser **exactamente 350** para gardar
  (`validateSeats` en `src/lib/predictions.ts`).
- Compartir unha predición crea unha ligazón curta `/s/<código>` con un
  código alfanumérico de 20 caracteres aleatorio e único (PK en
  `shared_predictions`), **inmutable**: xerada non se cambia nunca. Sen
  base de datos, recae no hash base64url (`#p=...`), que non toca a BD.
- Resultados anteriores e pronósticos publicados teñen URL propia breve
  derivada da súa clave (`/r/2023`, `/f/2026-09-cis-electomania`), construída
  en `src/lib/views.ts`; os slugs só cambian se se muda a clave na táboa.
