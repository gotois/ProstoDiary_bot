CREATE TABLE IF NOT EXISTS story.content (
id BIGSERIAL,

-- todo сюда добавить хэштеги

created_at TIMESTAMPTZ NOT NULL,
updated_at TIMESTAMP DEFAULT current_timestamp,
message_id UUID NOT NULL, -- message id

-- здесь находится первоначальный текст/фото/видео сообщения (zip если архив)
content BYTEA NOT NULL,
-- mime тип raw сообщения или encodingFormat
content_type VARCHAR(20) NOT NULL CHECK (content_type <> ''),

-- todo participant email
-- email_message_id TEXT CONSTRAINT must_be_different UNIQUE NOT NULL, -- сообщение почты
-- participant telegram
telegram_message_id TEXT CONSTRAINT must_be_different UNIQUE NOT NULL, -- сообщение телеграмма

-- type action, ярлык CreativeWork со всеми поддерживаемыми типами. отвечает за тип ассистента которому будет передаваться
schema SCHEMA NOT NULL,
-- todo переделать под ActionStatusType - https://schema.org/ActionStatusType
status STATUS_TYPE NOT NULL DEFAULT 'draft',-- тип записи от неточного к точному

PRIMARY KEY (id)
);

CREATE INDEX ON story.content (content_type);

GRANT ALL PRIVILEGES ON story.content TO bot;
