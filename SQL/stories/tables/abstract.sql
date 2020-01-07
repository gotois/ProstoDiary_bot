CREATE TABLE IF NOT EXISTS story.abstract (
id BIGSERIAL,
category TEXT NOT NULL,
context JSONB NOT NULL, -- структурированные данные которые можно превратить в n-quads / JSON-LD
content_id BIGINT NOT NULL,

PRIMARY KEY (id)
);

-- todo предоставить доступ на чтение для ассистентов разрешенных пользователем
-- ...
GRANT ALL PRIVILEGES ON story.abstract TO bot;
