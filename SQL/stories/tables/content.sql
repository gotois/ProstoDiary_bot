CREATE TABLE IF NOT EXISTS story.content (
id BIGSERIAL,

message_id UUID NOT NULL,
content BYTEA NOT NULL, -- здесь находится первоначальный текст/фото/видео сообщения
content_type VARCHAR(20) NOT NULL CHECK (content_type <> ''), -- mime тип raw сообщения
email_message_id TEXT CONSTRAINT must_be_different UNIQUE NOT NULL, -- сообщение почты
telegram_message_id BIGINT UNIQUE DEFAULT NULL, -- сообщение телеграмма
created_at TIMESTAMPTZ NOT NULL,
updated_at TIMESTAMP DEFAULT current_timestamp,
schema SCHEMA NOT NULL, -- ярлык, указывающий что именно может находиться в сообщении. отвечает за того ассистента которому будет передаваться
status STATUS_TYPE NOT NULL DEFAULT 'draft',-- тип записи от неточного к точному

PRIMARY KEY (id)
);

CREATE INDEX ON story.content (content_type);

GRANT ALL PRIVILEGES ON story.content TO bot;
