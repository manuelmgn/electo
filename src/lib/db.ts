import { sql } from "@vercel/postgres";

export function dbConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

export { sql };
