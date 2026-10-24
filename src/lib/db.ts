import postgres from "postgres";

// Ten que haber unha URL real (non baleira) env-var POSTGRES_URL.
export function dbConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL?.trim());
}

// Cliente Postgres en JS puro (sen dependencias nativas nin install
// scripts). Opcións axustadas ao pooler de Neon (PgBouncer en modo
// transacción):
//  - prepare: false  → reutilización de conexións efémera, ok.
//  - connect_timeout → non queda colgado indefinidamente se o pooler
//    tarda en devolver unha conexión.
//  - idle_timeout    → solta as conexións inactivas (evita o erro
//    "connection terminated abruptly" ao retomar tras un tempo parado,
//    cando o pooler xa pechouna por debaixo).
// A conexión é perezosa: só se abre coa primeira consulta.
export const sql: postgres.Sql = dbConfigured()
  ? postgres(process.env.POSTGRES_URL as string, {
      prepare: false,
      connect_timeout: 10,
      idle_timeout: 20,
    })
  : (null as unknown as postgres.Sql);
