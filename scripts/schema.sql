-- Executa este ficheiro na base de datos de Vercel Postgres
-- (Storage -> tu base de datos -> Query -> pega e executa).

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
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
