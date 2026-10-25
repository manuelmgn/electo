-- Esquema da base de datos (Vercel Postgres / Neon).
-- Executa este ficheiro na base de datos (Storage -> Create Database ->
-- Query -> pega e executa). Idempotente: tódolos bloques usan
-- CREATE TABLE IF NOT EXISTS, así que pode volver a executarse sen mal.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) <= 60),
  email TEXT NOT NULL UNIQUE CHECK (char_length(email) <= 254),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prediction_seats (
  prediction_id INTEGER NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  party_id TEXT NOT NULL,
  seats INTEGER NOT NULL CHECK (seats >= 0),
  PRIMARY KEY (prediction_id, party_id)
);

CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);

-- updated_at automático para calquera UPDATE de predictions; as rutas
-- API tamén o cubren de forma explícita, así que bases de datos
-- anteriores a este trigger seguen funcionando sen cambios.
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_predictions_updated_at ON predictions;
CREATE TRIGGER trg_predictions_updated_at
BEFORE UPDATE ON predictions
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE IF NOT EXISTS shared_predictions (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '' CHECK (char_length(title) <= 120),
  seats JSONB NOT NULL,
  governs JSONB NOT NULL DEFAULT '{}'::jsonb,
  allies JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notas:
--  - prediction_seats ten PK composta (prediction_id, party_id): xa
--    cobre as consultas por predición, sen índice extra.
--  - As restricións CHECK de lonxitude (nome, correo, títulos)
--    espellan as validacións das rutas API. Como todo usa
--    CREATE TABLE IF NOT EXISTS, só se aplican en bases de datos
--    novas; non altera táboas xa existentes.
