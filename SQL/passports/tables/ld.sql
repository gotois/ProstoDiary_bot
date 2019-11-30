CREATE TABLE IF NOT EXISTS ld (
passport_id UUID REFERENCES passport (id) ON UPDATE CASCADE ON DELETE CASCADE,
created_at TIMESTAMP DEFAULT current_timestamp,
-- JSONLD данные которые можно превратить в n-quads
jsonld JSONB NOT NULL
);

GRANT ALL PRIVILEGES ON ld TO bot;
