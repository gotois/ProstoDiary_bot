CREATE TABLE IF NOT EXISTS story.abstract (
id BIGSERIAL,
category CATEGORY NOT NULL, -- ярлык, указывающий что именно может находиться в сообщении. отвечает за того ассистента которому будет передаваться
context JSONB NOT NULL, -- структурированные данные которые можно превратить в n-quads / JSON-LD
content_id BIGINT NOT NULL,

created_at TIMESTAMP DEFAULT current_timestamp,

PRIMARY KEY (id)
);

-- todo предоставить доступ на чтение для ассистентов разрешенных пользователем
-- ...
GRANT ALL PRIVILEGES ON story.abstract TO bot;
