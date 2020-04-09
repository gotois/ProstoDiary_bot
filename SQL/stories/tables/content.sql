CREATE
    TABLE
        IF NOT EXISTS story.content (
            id BIGSERIAL
            ,created_at TIMESTAMPTZ NOT NULL -- todo сюда добавить хэштеги
            ,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ,message_id UUID NOT NULL
            ,content BYTEA NOT NULL  -- здесь находится первоначальный текст/фото/видео сообщения (zip если архив)
            ,content_type VARCHAR (20) NOT NULL CHECK (
                content_type <> ''
            ) -- mime тип raw сообщения или encodingFormat
            ,telegram_message_id TEXT CONSTRAINT must_be_different UNIQUE NOT NULL -- сообщение телеграмма
            ,SCHEMA SCHEMA NOT NULL -- type action, ярлык CreativeWork со всеми поддерживаемыми типами. отвечает за тип ассистента которому будет передаваться
            ,status STATUS_TYPE NOT NULL DEFAULT 'draft' -- тип записи от неточного к точному todo переделать под ActionStatusType - https://schema.org/ActionStatusType
            ,PRIMARY KEY (id)
        )
; CREATE
    INDEX
        ON story.content (content_type)
;
-- skip to heroku
GRANT ALL PRIVILEGES
    ON story.content TO bot
;
