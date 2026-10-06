import postgres from "postgres";

export function dbConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

// Cliente Postgres en JS puro (sen dependencias nativas nin install
// scripts). `prepare: false` por compatibilidade co pooler de Neon
// (PgBouncer en modo transacción). A conexión é perezosa: só se abre
// coa primeira consulta.
export const sql: postgres.Sql = dbConfigured()
  ? postgres(process.env.POSTGRES_URL as string, { prepare: false })
  : (null as unknown as postgres.Sql);
