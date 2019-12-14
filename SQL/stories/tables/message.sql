CREATE TABLE IF NOT EXISTS story.message (
id UUID DEFAULT uuid_generate_v4(), -- глобальная уникальная историческая ссылка

creator UUID NOT NULL, -- ответственный за создание записи
publisher UUID NOT NULL, -- ответственный за создание записи
revision INT DEFAULT 1, -- версия истории, автоинкрементировать с каждым обновлением message

experimental BOOLEAN DEFAULT FALSE, -- For testing purposes, not real usage
version VARCHAR(20) NOT NULL CHECK (version <> ''), -- Bot Version. отсюда же можно узнать и api version. Нужен для взаимодействия с ассистентами. Аналогичен version в package.json на момент записи - нужен для проверки необходимости обновить историю бота или изменению формата хранения

updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp, -- время необходимое для того чтобы знать что оно было изменено

PRIMARY KEY (id)
);

CREATE INDEX ON story.message (creator);
CREATE INDEX ON story.message (publisher);

GRANT ALL PRIVILEGES ON story.message TO bot;
