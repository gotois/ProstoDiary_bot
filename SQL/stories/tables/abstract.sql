CREATE TABLE IF NOT EXISTS story.abstract (
id BIGSERIAL,
category TEXT NOT NULL, -- CreativeWork @type
context JSONB NOT NULL, -- CreativeWork Full Values
content_id BIGINT NOT NULL,

PRIMARY KEY (id)
);

GRANT ALL PRIVILEGES ON story.abstract TO bot;
