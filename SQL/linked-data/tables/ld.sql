CREATE SCHEMA data;

CREATE TABLE IF NOT EXISTS data.ld (
id BIGSERIAL,
jsonld JSONB NOT NULL, -- JSONLD данные которые можно превратить в n-quads
created_at TIMESTAMP DEFAULT current_timestamp,
PRIMARY KEY (id)
);

GRANT ALL PRIVILEGES ON data.ld TO bot;
