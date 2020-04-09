CREATE
    TABLE
        IF NOT EXISTS story.message (
            id UUID DEFAULT uuid_generate_v4 (
            ) -- глобальная уникальная историческая ссылка
            ,namespace TEXT -- спейсы
            ,revision INT DEFAULT 1 -- версия истории, автоинкрементировать с каждым обновлением message
            ,experimental BOOLEAN DEFAULT FALSE -- For testing purposes, not real usage
            ,version VARCHAR (20) NOT NULL CHECK (
                version <> ''
            ) -- x-bot-version. отсюда же можно узнать и api version. Нужен для взаимодействия с ассистентами. Аналогичен version в package.json на момент записи - нужен для проверки необходимости обновить историю бота или изменению формата хранения
            ,updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
 -- fixme новое из startTime вида 2020-02-15
 --created_at TIMESTAMP NOT NULL,
 -- todo раскомментировать !
 -- Персона/Организация которая ответственна до попадания в assistant (например сам пользователь)
 -- creator UUID NOT NULL, -- ответственный за создание записи -- это assistant ID: Telegram или Email
 			,publisher UUID NOT NULL -- ответственный за создание записи, Bot ID
            ,PRIMARY KEY (id)
        )
; --CREATE INDEX ON story.message (creator); // todo поддержать
 CREATE
    INDEX
        ON story.message (publisher)
;
-- skip to heroku
GRANT ALL PRIVILEGES
    ON story.message TO bot
;
